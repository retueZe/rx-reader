import { Failure, FailureLike, Result, Success } from 'async-option'
import { AsyncResult } from 'async-option/async'
import { Observable, Subject, Unsubscribable } from 'rxjs'
import type { ChunkTypeId, ChunkTypeMap, SimpleOperator, ComplexOperator, SimpleOperatorIterator, IIoBuffer, IReader } from '../index.js'
import { InterpreterCallback, INTERPRETERS } from '../private/interpreter.js'
import { ContextCollection } from './ContextCollection.js'

export class Reader<C extends ChunkTypeId = 'text'> implements IReader<C> {
    private readonly _pushSubject: Subject<void> = new Subject()
    private readonly _bufferSubscription: Unsubscribable | null = null
    private readonly _buffer: IIoBuffer<C>
    isCompleted = false
    get chunkTypeId(): C {
        return this._buffer.chunkTypeId
    }
    get isBinary(): boolean {
        return this.chunkTypeId === 'binary'
    }
    readonly push: Observable<void> = this._pushSubject.asObservable()

    constructor(buffer: IIoBuffer<C>) {
        this._buffer = buffer
        this._bufferSubscription = this._buffer.push.subscribe({
            next: () => this._pushSubject.next(),
            error: this._error.bind(this),
            complete: this.unsubscribe.bind(this)
        })
    }

    private static _makeInterpreterCallback<C extends ChunkTypeId = 'text'>(
        resolve: (chunk: ChunkTypeMap[C]) => void,
        reject: (error: Error) => void
    ): InterpreterCallback<C> {
        return chunk => chunk.isSucceeded
            ? resolve(chunk.value)
            : reject(chunk.error)
    }
    private _error(error: Error): void {
        if (this.isCompleted) return
        if (this._bufferSubscription !== null) this._bufferSubscription.unsubscribe()

        this._pushSubject.error(error)
    }
    unsubscribe(): void {
        if (this.isCompleted) return

        this.isCompleted = true

        if (this._bufferSubscription !== null) this._bufferSubscription.unsubscribe()

        this._pushSubject.complete()
    }
    read(operator: SimpleOperator<C>): Promise<ChunkTypeMap[C]>
    read<O, E>(operator: ComplexOperator<O, E, C>, contexts?: Iterable<any> | null): AsyncResult<O, E>
    read(
        operator: SimpleOperator<C> | ComplexOperator<unknown, unknown, C>,
        contexts?: Iterable<any> | null
    ): Promise<unknown> {
        const contextCollection = new ContextCollection()

        if (typeof contexts !== 'undefined' && contexts !== null)
            for (const context of contexts)
                contextCollection.set(context)

        return typeof operator === 'function'
            ? new AsyncResult(new Promise<Result<unknown>>((resolve, reject) =>
                this._interpretComplexOperator(operator(), resolve, reject, contextCollection)))
            : new Promise((resolve, reject) => {
                const callback = Reader._makeInterpreterCallback<C>(resolve, reject)
                const result = this._interpretSimpleOperator(operator, callback)

                if (result !== null) return callback(result)
            })
    }
    private _interpretSimpleOperator(
        operator: SimpleOperator<C>,
        callback: InterpreterCallback<C>,
        contexts?: ContextCollection | null
    ): Result<ChunkTypeMap[C], Error> | null {
        contexts ??= new ContextCollection()

        // TODO
        return INTERPRETERS[this.chunkTypeId][operator.id](operator.args as any, this, this._buffer, contexts, callback)
    }
    private _interpretComplexOperator(
        iterator: SimpleOperatorIterator<unknown, unknown, C>,
        resolve: (result: Result<unknown>) => void,
        reject: (error: unknown) => void,
        contexts?: ContextCollection | null,
        chunk?: Result<ChunkTypeMap[C], Error> | null,
    ): void {
        contexts ??= new ContextCollection()
        const boundInterpreter = this._interpretComplexOperator.bind(this, iterator, resolve, reject, contexts)

        while (true) {
            if (typeof chunk !== 'undefined' && chunk !== null && !chunk.isSucceeded)
                return reject(chunk.error)

            let iteratorResult: IteratorResult<SimpleOperator<C>, unknown>

            try {
                iteratorResult = typeof chunk === 'undefined' || chunk === null
                    ? iterator.next()
                    : iterator.next(chunk.value)
            } catch (error) {
                if (typeof error === 'object' && error !== null && 'isSucceeded' in error)
                    return resolve(error instanceof Failure
                        ? error
                        : new Failure((error as FailureLike).error))

                reject(error)

                return
            }

            const {value, done} = iteratorResult

            if (done ?? false) return resolve(new Success(value))

            const operator = value
            const interpreterResult = this._interpretSimpleOperator(operator, boundInterpreter, contexts)
            chunk = interpreterResult

            if (chunk === null) break
        }
    }
}
