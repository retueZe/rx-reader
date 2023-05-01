import { NONE, Option, Some } from 'async-option'
import { Observable, Subject } from 'rxjs'
import type { ChunkTypeId, ChunkTypeMap } from './abstraction'
import { getEmptyChunk, joinChunks, subviewChunk } from './utils'

export interface IoBuffer<C extends ChunkTypeId = 'text'> {
    readonly available: number
    readonly chunkTypeId: C
    readonly onPush: Observable<void>

    push(chunk: ChunkTypeMap[C]): this
    shift(): Option<ChunkTypeMap[C]>
    first(): Option<ChunkTypeMap[C]>
    read(count: number, output: ChunkTypeMap[C][]): number
    read(count: number): ChunkTypeMap[C]
    peek(count: number, output: ChunkTypeMap[C][]): number
    peek(count: number): ChunkTypeMap[C]
    skip(count: number): number
    require(count: number): Promise<number>
}
type IoBufferInterface<C extends ChunkTypeId = 'text'> = IoBuffer<C>
export const IoBuffer: IoBufferConstructor = class IoBuffer<C extends ChunkTypeId = 'text'> implements IoBufferInterface<C> {
    private readonly _onPushSubject = new Subject<void>()
    private _head: ChunkNode<C> | null = null
    private _tail: ChunkNode<C> | null = null
    available = 0
    readonly chunkTypeId: C
    readonly onPush: Observable<void> = this._onPushSubject.asObservable()

    constructor(chunkTypeId: C) {
        this.chunkTypeId = chunkTypeId
    }

    push(chunk: ChunkTypeMap[C]): this {
        const next: ChunkNode<C> = {next: null, chunk}

        if (this._tail === null)
            this._head = this._tail = next
        else {
            this._tail.next = next
            this._tail = next
        }

        this.available += chunk.length
        this._onPushSubject.next()

        return this
    }
    shift(): Option<ChunkTypeMap[C]> {
        if (this._head === null) return NONE

        const chunk = this._head.chunk
        this._head = this._head.next

        if (this._head === null) this._tail = null

        this.available -= chunk.length

        return new Some(chunk)
    }
    first(): Option<ChunkTypeMap[C]> {
        if (this._head === null) return NONE

        const chunk = this._head.chunk

        return new Some(chunk)
    }
    private _checkCount(count: number): number {
        count = Math.floor(count)

        if (count < -0.5) throw new RangeError('Negative count.')

        return count
    }
    read(count: number, output: ChunkTypeMap[C][]): number
    read(count: number): ChunkTypeMap[C]
    read(count: number, output?: ChunkTypeMap[C][]): number | ChunkTypeMap[C] {
        count = this._checkCount(count)
        const returnJoined = typeof output === 'undefined'
        output ??= []
        let readed = 0

        for (let current = this._head; current !== null; current = current.next) {
            const chunk = current.chunk

            if (typeof chunk === 'undefined') break
            if (count < chunk.length - 0.5) {
                output.push(subviewChunk(chunk, 0, count))
                readed += count
                current.chunk = subviewChunk(chunk, count)
                this.available -= count

                break
            }

            output.push(chunk)
            count -= chunk.length
            readed += chunk.length
            this.shift()

            if (count < 0.5) break
        }

        return returnJoined
            ? output[0].length < 0.5
                ? getEmptyChunk(this.chunkTypeId)
                : joinChunks(output[0], ...output.slice(1))
            : readed
    }
    peek(count: number, output: ChunkTypeMap[C][]): number
    peek(count: number): ChunkTypeMap[C]
    peek(count: number, output?: ChunkTypeMap[C][]): number | ChunkTypeMap[C] {
        count = this._checkCount(count)
        const returnJoined = typeof output === 'undefined'
        output ??= []
        let peeked = 0

        for (let current = this._head; current !== null; current = current.next) {
            const chunk = current.chunk

            if (count < chunk.length - 0.5) {
                output.push(subviewChunk(chunk, 0, count))
                peeked += count

                break
            }

            output.push(chunk)
            count -= chunk.length
            peeked += chunk.length

            if (count < 0.5) break
        }

        return returnJoined
            ? output[0].length < 0.5
                ? getEmptyChunk(this.chunkTypeId)
                : joinChunks(output[0], ...output.slice(1))
            : peeked
    }
    skip(count: number): number {
        count = this._checkCount(count)
        let skipped = 0

        for (let current = this._head; current !== null; current = current.next) {
            const chunk = current.chunk

            if (count < chunk.length - 0.5) {
                skipped += count
                current.chunk = subviewChunk(chunk, count)
                this.available -= count

                break
            }

            count -= chunk.length
            skipped += chunk.length
            this.shift()

            if (count < 0.5) break
        }

        return skipped
    }
    require(count: number): Promise<number> {
        count = this._checkCount(count)

        return new Promise(resolve => {
            const subscription = this.onPush.subscribe((function(this: IoBuffer<C>) {
                if (this.available < count - 0.5) return

                subscription.unsubscribe()
                resolve(this.available)
            }).bind(this))
        })
    }
}
interface IoBufferConstructor {
    readonly prototype: IoBuffer<any>

    new<C extends ChunkTypeId = 'text'>(chunkTypeId: C): IoBuffer<C>
}

type ChunkNode<C extends ChunkTypeId = 'text'> = {
    next: ChunkNode<C> | null
    chunk: ChunkTypeMap[C]
}
