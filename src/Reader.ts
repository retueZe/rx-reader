import { Result } from 'async-option'
import { AsyncResult } from 'async-option/async'
import { Observable, Subject, Unsubscribable } from 'rxjs'
import { IoBuffer } from './IoBuffer'
import type { ChunkTypeId, ChunkTypeMap, SimpleOperator, ComplexOperator, SimpleOperatorIterator } from './abstraction'
import { InterpreterCallback, INTERPRETERS } from './private/interpreter'

export interface Reader<C extends ChunkTypeId = 'text'> extends Unsubscribable {
    readonly isCompleted: boolean
    readonly available: number
    readonly chunkTypeId: C
    readonly isBinary: boolean
    readonly onPush: Observable<ChunkTypeMap[C]>

    read(operator: SimpleOperator): Promise<ChunkTypeMap[C]>
    read<O, E>(operator: ComplexOperator<O, E, C>): AsyncResult<O, E>
}
type ReaderInterface<C extends ChunkTypeId = 'text'> = Reader<C>
export const Reader: ReaderConstructor = class Reader<C extends ChunkTypeId = 'text'> implements ReaderInterface<C> {
    private readonly _onPushSubject: Subject<ChunkTypeMap[C]> = new Subject()
    private readonly _subscription: Unsubscribable
    private readonly _buffer: IoBuffer<C>
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
    readonly onPush: Observable<ChunkTypeMap[C]> = this._onPushSubject.asObservable()

    constructor(chunkTypeId: C, source: Observable<ChunkTypeMap[C]>)
    constructor(buffer: IoBuffer<C>, source: Observable<ChunkTypeMap[C]>)
    constructor(buffer: C | IoBuffer<C>, source: Observable<ChunkTypeMap[C]>) {
        this._buffer = typeof buffer === 'string' ? new IoBuffer(buffer) : buffer
        this._buffer.onPush.subscribe(this._onPushSubject.next.bind(this._onPushSubject))
        this._subscription = source.subscribe({
            next: this._next.bind(this),
            complete: this.unsubscribe.bind(this)
        })
    }

    private _next(chunk: ChunkTypeMap[C]): void {
        if (this.isCompleted) return

        this._buffer.push(chunk)
    }
    unsubscribe(): void {
        this.isCompleted = true
        this._subscription.unsubscribe()
        this._onPushSubject.complete()
    }
    read(operator: SimpleOperator): Promise<ChunkTypeMap[C]>
    read<O, E>(operator: ComplexOperator<O, E, C>): AsyncResult<O, E>
    read(operator: SimpleOperator | ComplexOperator<unknown, unknown, C>): Promise<unknown> {
        return typeof operator === 'function'
            ? new Promise(resolve => this._interpretComplexOperator(operator(), resolve))
            : new Promise(resolve => this._interpretSimpleOperator(operator, resolve))
    }
    private _interpretSimpleOperator(
        operator: SimpleOperator,
        callback: InterpreterCallback<C>
    ): ChunkTypeMap[C] | null {
        return INTERPRETERS[operator.id](operator.args, this, this._buffer, callback)
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
