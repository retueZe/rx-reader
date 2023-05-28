import type { Result } from 'async-option'
import { AsyncResult } from 'async-option/async'
import { Observable, Subject, Unsubscribable } from 'rxjs'
import type { IIoBuffer } from '../IoBuffer'
import type { ChunkTypeId, ChunkTypeMap, SimpleOperator, ComplexOperator, SimpleOperatorIterator, IReader } from '../abstraction'
import { InterpreterCallback, INTERPRETERS } from '../private/interpreter'

export const Reader: ReaderConstructor = class Reader<C extends ChunkTypeId = 'text'> implements IReader<C> {
    private readonly _onPushSubject: Subject<void> = new Subject()
    private readonly _bufferSubscription: Unsubscribable | null = null
    private readonly _buffer: IIoBuffer<C>
    get isCompleted(): boolean {
        return this._onPushSubject.closed
    }
    get chunkTypeId(): C {
        return this._buffer.chunkTypeId
    }
    get isBinary(): boolean {
        return this.chunkTypeId === 'binary'
    }
    readonly onPush: Observable<void> = this._onPushSubject.asObservable()

    constructor(buffer: IIoBuffer<C>) {
        this._buffer = buffer
        this._bufferSubscription = this._buffer.onPush.subscribe({
            next: () => this._onPushSubject.next(),
            error: this._error.bind(this),
            complete: this.unsubscribe.bind(this)
        })
    }

    private _error(error: Error): void {
        if (this.isCompleted) return
        if (this._bufferSubscription !== null) this._bufferSubscription.unsubscribe()

        this._onPushSubject.error(error)
    }
    unsubscribe(): void {
        if (this.isCompleted) return
        if (this._bufferSubscription !== null) this._bufferSubscription.unsubscribe()

        this._onPushSubject.complete()
    }
    read(operator: SimpleOperator<C>): Promise<ChunkTypeMap[C]>
    read<O, E>(operator: ComplexOperator<O, E, C>): AsyncResult<O, E>
    read(operator: SimpleOperator<C> | ComplexOperator<unknown, unknown, C>): Promise<unknown> {
        return typeof operator === 'function'
            ? new AsyncResult(new Promise<Result<unknown>>((resolve, reject) =>
                this._interpretComplexOperator(operator(), resolve, reject)))
            : new Promise((resolve, reject) => {
                const callback = Reader._makeInterpreterCallback<C>(resolve, reject)
                const result = this._interpretSimpleOperator(operator, callback)

                if (result !== null) return callback(result)
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
    private _interpretSimpleOperator(
        operator: SimpleOperator<C>,
        callback: InterpreterCallback<C>
    ): Result<ChunkTypeMap[C], Error> | null {
        // TODO
        return INTERPRETERS[this.chunkTypeId][operator.id](operator.args as any, this, this._buffer, callback)
    }
    private _interpretComplexOperator(
        iterator: SimpleOperatorIterator<unknown, unknown, C>,
        resolve: (result: Result<unknown>) => void,
        reject: (error: Error) => void,
        chunk?: Result<ChunkTypeMap[C], Error> | null,
    ): void {
        const boundInterpreter = this._interpretComplexOperator.bind(this, iterator, resolve, reject)

        while (true) {
            if (typeof chunk !== 'undefined' && chunk !== null && !chunk.isSucceeded)
                return reject(chunk.error)

            const {value, done} = typeof chunk === 'undefined' || chunk === null
                ? iterator.next()
                : iterator.next(chunk.value)

            if (done ?? false) return resolve(value as Result<unknown>)

            const operator = value
            const interpreterResult = this._interpretSimpleOperator(operator, boundInterpreter)
            chunk = interpreterResult

            if (chunk === null) break
        }
    }
}
interface ReaderConstructor {
    readonly prototype: IReader<any>

    new<C extends ChunkTypeId = 'text'>(buffer: IIoBuffer<C>): IReader<C>
}
