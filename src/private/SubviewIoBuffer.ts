import type { Option } from 'async-option'
import type { Observable, Observer, Subscribable, Unsubscribable } from 'rxjs'
import type { IIoBuffer, ChunkTypeId, ChunkTypeMap, IReader } from '../index.js'
import { joinChunks } from '../utils/index.js'
import { Reader } from './Reader.js'

export type PeekCallback<C extends ChunkTypeId = 'text'> =
    (count: number | null, start: number, output: ChunkTypeMap[C][]) => number
export type FirstCallback<C extends ChunkTypeId = 'text'> = (start: number) => Option<ChunkTypeMap[C]>

export class SubviewIoBuffer<C extends ChunkTypeId = 'text'> implements IIoBuffer<C> {
    private _start: number
    get available(): number {
        return this._source.available - this._start
    }
    get chunkTypeId(): C {
        return this._source.chunkTypeId
    }
    get isBinary(): boolean {
        return this._source.isBinary
    }
    get isEmpty(): boolean {
        return this.available < 0.5
    }
    get isCompleted(): boolean {
        return this._source.isCompleted
    }
    get push(): Observable<ChunkTypeMap[C]> {
        return this._source.push
    }

    constructor(
        private readonly _source: IIoBuffer<C>,
        private readonly _peek: PeekCallback<C>,
        private readonly _first: FirstCallback<C>,
        start?: number | null
    ) {
        this._start = SubviewIoBuffer._checkStart(start)
    }

    private static _checkStart(start?: number | null): number {
        start ??= 0
        start = Math.floor(start)

        if (start < -0.5) throw new RangeError('Start cannot be negative.')

        return start
    }
    next(chunk: ChunkTypeMap[C]): this {
        this._source.next(chunk)

        return this
    }
    error(error: unknown): void {
        this._source.error(error)
    }
    complete(): void {
        this._source.complete()
    }
    shift(): Option<ChunkTypeMap[C]> {
        return this.first().onSome(chunk => {
            this._start += chunk.length
        })
    }
    first(): Option<ChunkTypeMap[C]> {
        return this._first(this._start)
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
        const peekResult = typeof output === 'undefined'
            ? this.peek(count)
            : this.peek(count ?? null, output)
        this.skip(typeof peekResult === 'number' ? peekResult : peekResult.length)

        return peekResult
    }
    peek(count: number | null, output: ChunkTypeMap[C][]): number
    peek(count?: number | null): ChunkTypeMap[C]
    peek(count?: number | null, output?: ChunkTypeMap[C][]): number | ChunkTypeMap[C] {
        count = this._checkCount(count)
        const returnJoined = typeof output === 'undefined'
        output ??= []

        const peeked = this._peek(count, this._start, output)

        return returnJoined
            ? joinChunks(this.chunkTypeId, output)
            : peeked
    }
    skip(count?: number | null): number {
        count = this._checkCount(count)
        count = count === null ? this.available : Math.min(count, this.available)
        this._start += count

        return count
    }
    require(count: number, callback: (available: number) => void): void {
        count = this._checkCount(count)!

        if (this.available > count - 0.5) return callback(this.available)

        const subscription = this.push.subscribe(() => {
            if (this.available < count - 0.5) return

            subscription.unsubscribe()
            callback(this.available)
        })
    }
    pipe(target: Observer<ChunkTypeMap[C]>): Unsubscribable {
        return this.push.subscribe({
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
    subview(start?: number | null): IIoBuffer<C> {
        start = SubviewIoBuffer._checkStart(start)

        return this._source.subview(this._start + start)
    }
}
