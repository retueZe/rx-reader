import { NONE, Option, Some } from 'async-option'
import { Observable, Observer, Subject, Subscribable, Unsubscribable } from 'rxjs'
import type { ChunkTypeId, ChunkTypeMap, IReader } from './abstraction'
import { Reader } from './private/Reader'
import { SubviewIoBuffer } from './private/SubviewIoBuffer'
import { getEmptyChunk, joinChunks, subviewChunk } from './utils'

export interface IoBuffer<C extends ChunkTypeId = 'text'> extends Observer<ChunkTypeMap[C]> {
    readonly available: number
    readonly chunkTypeId: C
    readonly isBinary: boolean
    readonly isEmpty: boolean
    readonly isCompleted: boolean
    readonly onPush: Observable<ChunkTypeMap[C]>

    next(chunk: ChunkTypeMap[C]): this
    shift(): Option<ChunkTypeMap[C]>
    first(): Option<ChunkTypeMap[C]>
    read(count: number | null, output: ChunkTypeMap[C][]): number
    read(count?: number | null): ChunkTypeMap[C]
    peek(count: number | null, output: ChunkTypeMap[C][]): number
    peek(count?: number | null): ChunkTypeMap[C]
    skip(count?: number | null): number
    require(count: number, callback: (available: number) => void): void
    pipe(target: IoBuffer<C>): Unsubscribable
    consume(source: Subscribable<ChunkTypeMap[C]>): Unsubscribable
    createReader(): IReader<C>
    subview(start?: number | null): IoBuffer<C>
}
type IoBufferInterface<C extends ChunkTypeId = 'text'> = IoBuffer<C>
export const IoBuffer: IoBufferConstructor = class IoBuffer<C extends ChunkTypeId = 'text'> implements IoBufferInterface<C> {
    private readonly _onPushSubject = new Subject<ChunkTypeMap[C]>()
    private _head: ChunkNode<C> | null = null
    private _tail: ChunkNode<C> | null = null
    available = 0
    readonly chunkTypeId: C
    get isCompleted(): boolean {
        return this._onPushSubject.closed
    }
    get isBinary(): boolean {
        return this.chunkTypeId === 'binary'
    }
    get isEmpty(): boolean {
        return this.available < 0.5
    }
    readonly onPush: Observable<ChunkTypeMap[C]> = this._onPushSubject.asObservable()

    constructor(chunkTypeId: C) {
        this.chunkTypeId = chunkTypeId
    }

    next(chunk: ChunkTypeMap[C]): this {
        const next: ChunkNode<C> = {next: null, chunk}

        if (this._tail === null)
            this._head = this._tail = next
        else {
            this._tail.next = next
            this._tail = next
        }

        this.available += chunk.length
        this._onPushSubject.next(chunk)

        return this
    }
    error(error: Error): void {
        this._onPushSubject.error(error)
    }
    complete(): void {
        this._onPushSubject.complete()
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
    private _checkCount(count?: number | null): number | null {
        if (typeof count !== 'number') return null

        count = Math.floor(count)

        if (count < -0.5) throw new RangeError('Negative count.')

        return count
    }
    read(count: number | null, output: ChunkTypeMap[C][]): number
    read(count?: number | null): ChunkTypeMap[C]
    read(count?: number | null, output?: ChunkTypeMap[C][]): number | ChunkTypeMap[C] {
        count = this._checkCount(count)

        if (count === null) return this._readAll(output)

        const returnJoined = typeof output === 'undefined'
        output ??= []
        let readed = 0

        for (let current = this._head; current !== null; current = current.next) {
            const chunk = current.chunk

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
            ? output.length < 0.5
                ? getEmptyChunk(this.chunkTypeId)
                : joinChunks(output[0], ...output.slice(1))
            : readed
    }
    private _readAll(output?: ChunkTypeMap[C][]): number | ChunkTypeMap[C] {
        const returnJoined = typeof output === 'undefined'
        output ??= []
        let readed = 0

        for (let current = this._head; current !== null; current = current.next) {
            const chunk = current.chunk
            output.push(chunk)
            readed += chunk.length
        }

        this._clear()

        return returnJoined
            ? output.length < 0.5
                ? getEmptyChunk(this.chunkTypeId)
                : joinChunks(output[0], ...output.slice(1))
            : readed
    }
    private _clear() {
        this.available = 0
        this._head = this._tail = null
    }
    peek(count: number | null, output: ChunkTypeMap[C][]): number
    peek(count?: number | null): ChunkTypeMap[C]
    peek(count?: number | null, output?: ChunkTypeMap[C][]): number | ChunkTypeMap[C] {
        count = this._checkCount(count)

        if (count === null) return this._peekAll(output)

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
            ? output.length < 0.5
                ? getEmptyChunk(this.chunkTypeId)
                : joinChunks(output[0], ...output.slice(1))
            : peeked
    }
    private _peekAll(output?: ChunkTypeMap[C][]): number | ChunkTypeMap[C] {
        const returnJoined = typeof output === 'undefined'
        output ??= []
        let peeked = 0

        for (let current = this._head; current !== null; current = current.next) {
            const chunk = current.chunk
            output.push(chunk)
            peeked += chunk.length
        }

        return returnJoined
            ? output.length < 0.5
                ? getEmptyChunk(this.chunkTypeId)
                : joinChunks(output[0], ...output.slice(1))
            : peeked
    }
    skip(count?: number | null): number {
        count = this._checkCount(count)

        if (count === null) return this._skipAll()

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
    private _skipAll(): number {
        const skipped = this.available
        this._clear()

        return skipped
    }
    require(count: number, callback: (available: number) => void): void {
        count = this._checkCount(count)!

        if (this.available > count - 0.5) return callback(this.available)

        const subscription = this.onPush.subscribe(() => {
            if (this.available < count - 0.5) return

            subscription.unsubscribe()
            callback(this.available)
        })
    }
    pipe(target: Observer<ChunkTypeMap[C]>): Unsubscribable {
        return this.onPush.subscribe({
            next: chunk => target.next(chunk),
            error: error => target.error(error)
        })
    }
    consume(source: Subscribable<ChunkTypeMap[C]>): Unsubscribable {
        return source.subscribe({
            next: this.next.bind(this)
        })
    }
    createReader(): IReader<C> {
        return new Reader(this)
    }
    subview(start?: number | null | undefined): IoBufferInterface<C> {
        return new SubviewIoBuffer(
            this,
            this._subviewPeek.bind(this),
            this._subviewFirst.bind(this),
            start)
    }
    private _subviewPeek(count: number | null, start: number, output: ChunkTypeMap[C][]): number {
        let current = this._head

        if (current === null) return 0
        if (start > this.available - 0.5) return 0

        for (; current !== null; current = current.next)
            if (start > current.chunk.length - 0.5) {
                start -= current.chunk.length
            } else
                break

        if (current === null) throw new Error('STUB')

        let peeked = 0

        if (start > 0.5) {
            const chunk = current.chunk
            const end = count === null ? null : Math.min(start + count, chunk.length)
            const subview = subviewChunk(chunk, start, end)
            output.push(subview)
            peeked += subview.length
            start = 0
            current = current.next

            if (count !== null) count -= subview.length
        }

        for (; current !== null; current = current.next) {
            const chunk = current.chunk
            const toPeek = count === null ? chunk.length : Math.min(count, chunk.length)
            peeked += toPeek
            output.push(subviewChunk(chunk, 0, toPeek))

            if (count !== null) count -= toPeek
            if (toPeek < chunk.length - 0.5) break
        }

        return peeked
    }
    private _subviewFirst(start: number): Option<ChunkTypeMap[C]> {
        let current = this._head

        if (current === null) return NONE
        if (start > this.available - 0.5) return NONE

        for (; current !== null; current = current.next)
            if (start > current.chunk.length - 0.5) {
                start -= current.chunk.length
            } else
                break

        if (current === null) throw new Error('STUB')

        return new Some(subviewChunk(current.chunk, start))
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
