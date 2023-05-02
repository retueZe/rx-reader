import { Option, Result } from 'async-option'
import { AsyncResult } from 'async-option/async'
import { Observable, Unsubscribable } from 'rxjs'
import { IoBuffer } from './IoBuffer'
import type { ChunkTypeId, ChunkTypeMap, SimpleOperator, ComplexOperator, SimpleOperatorIterator } from './abstraction'
import { getEmptyChunk } from './utils/chunk'

export interface Reader<C extends ChunkTypeId = 'text'> extends Unsubscribable {
    readonly isCompleted: boolean
    readonly available: number
    readonly chunkTypeId: C
    readonly isBinary: boolean
    readonly onPush: Observable<ChunkTypeMap[C]>

    read(operator: SimpleOperator): Promise<ChunkTypeMap[C]>
    read<O, E>(operator: ComplexOperator<O, E, C>): AsyncResult<O, E>
    query(operator: SimpleOperator): Option<ChunkTypeMap[C]>
    query<O, E>(operator: ComplexOperator<O, E, C>): Option<Result<O, E>>
}
type ReaderInterface<C extends ChunkTypeId = 'text'> = Reader<C>
export const Reader: ReaderConstructor = class Reader<C extends ChunkTypeId = 'text'> implements ReaderInterface<C> {
    private readonly _subscription: Unsubscribable
    private readonly _buffer: IoBuffer<C>
    private _isUnsubscribed = false
    isCompleted = false
    get available(): number {
        return this._buffer.available
    }
    get chunkTypeId(): C {
        return this._buffer.chunkTypeId
    }
    get isBinary(): boolean {
        return this.chunkTypeId === 'binary'
    }
    get onPush(): Observable<ChunkTypeMap[C]> {
        return this._buffer.onPush
    }

    constructor(chunkTypeId: C, source: Observable<ChunkTypeMap[C]>)
    constructor(buffer: IoBuffer<C>, source: Observable<ChunkTypeMap[C]>)
    constructor(buffer: C | IoBuffer<C>, source: Observable<ChunkTypeMap[C]>) {
        this._buffer = typeof buffer === 'string' ? new IoBuffer(buffer) : buffer
        this._subscription = source.subscribe({
            next: this._next.bind(this),
            complete: this._complete.bind(this)
        })
    }

    private _next(chunk: ChunkTypeMap[C]): void {
        if (this.isCompleted) return

        this._buffer.push(chunk)
    }
    private _complete(): void {
        this.isCompleted = true
    }
    unsubscribe(): void {
        this._isUnsubscribed = true
        this.isCompleted = true
    }
    read(operator: SimpleOperator): Promise<ChunkTypeMap[C]>
    read<O, E>(operator: ComplexOperator<O, E, C>): AsyncResult<O, E>
    read(operator: SimpleOperator | ComplexOperator<unknown, unknown, C>): Promise<unknown> {
        return typeof operator === 'function'
            ? new Promise(resolve => this._interpretComplexOperator(operator(), resolve))
            : new Promise(resolve => this._interpretSimpleOperator(operator, resolve))
    }
    query(operator: SimpleOperator): Option<ChunkTypeMap[C]>
    query<O, E>(operator: ComplexOperator<O, E, C>): Option<Result<O, E>>
    query(operator: SimpleOperator | ComplexOperator<unknown, unknown, C>): Option<unknown> {
        // TODO
        return null as any
    }
    private _interpretSimpleOperator(
        operator: SimpleOperator,
        callback: InterpreterCallback<C>
    ): ChunkTypeMap[C] | null {
        if (operator.id === 'read') {
            const count = operator.args.count

            if (count < this.available + 0.5) return this._buffer.read(count)

            this.onPush.subscribe(() => {
                if (count > this.available + 0.5) return

                callback(this._buffer.read(count))
            })

            return null
        }

        return getEmptyChunk(this.chunkTypeId)
    }
    private _interpretComplexOperator(
        iterator: SimpleOperatorIterator<unknown, unknown, C>,
        receiver: (result: Result<unknown>) => void,
        chunk?: ChunkTypeMap[C] | null,
    ): void {
        const boundInterpreter = this._interpretComplexOperator.bind(this, iterator, receiver)

        while (true) {
            const {value, done} = typeof chunk === 'undefined' || chunk === null
                ? iterator.next()
                : iterator.next(chunk)

            if (done ?? false) return receiver(value as Result<unknown>)

            const operator = value as SimpleOperator
            const interpreterResult = this._interpretSimpleOperator(operator, boundInterpreter)
            chunk = interpreterResult

            if (chunk === null) break
        }
    }
}
interface ReaderConstructor {
    readonly prototype: Reader<any>

    new<C extends ChunkTypeId = 'text'>(buffer: IoBuffer<C>, source: Observable<ChunkTypeMap[C]>): Reader<C>
    new<C extends ChunkTypeId = 'text'>(chunkTypeId: C, source: Observable<ChunkTypeMap[C]>): Reader<C>
}

type InterpreterCallback<C extends ChunkTypeId = 'text'> = (chunk: ChunkTypeMap[C]) => void
