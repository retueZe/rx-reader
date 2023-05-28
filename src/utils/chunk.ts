import type { ChunkItemTypeMap, ChunkTypeId, ChunkTypeMap } from '..'

export type ChunkTypeIdFromChunkType<C> = C extends string
    ? 'text'
    : C extends Uint8Array
        ? 'binary'
        : never

export function subviewChunk<C extends ChunkTypeId>(
    chunk: ChunkTypeMap[C],
    start?: number | null,
    end?: number | null
): ChunkTypeMap[C] {
    return typeof chunk === 'string'
        ? chunk.slice(start ?? 0, end ?? chunk.length) as ChunkTypeMap[C]
        : chunk.subarray(start ?? 0, end ?? chunk.length) as ChunkTypeMap[C]
}
export function joinChunks<C extends ChunkTypeId>(
    first: ChunkTypeMap[C],
    ...chunks: ChunkTypeMap[C][]
): ChunkTypeMap[C] {
    if (typeof first === 'string') {
        chunks.unshift(first)

        return chunks.join('') as ChunkTypeMap[C]
    }

    const merged = new Uint8Array(first.length + chunks.reduce((sum, chunk) => sum + chunk.length, 0))
    merged.set(first)
    let offset = first.length

    for (const chunk of chunks) {
        merged.set(chunk as Uint8Array, offset)
        offset += chunk.length
    }

    return merged as ChunkTypeMap[C]
}
export function getEmptyChunk<C extends ChunkTypeId>(typeId: C): ChunkTypeMap[C] {
    return typeId === 'text'
        ? '' as ChunkTypeMap[C]
        : new Uint8Array() as ChunkTypeMap[C]
}
export function getChunkItem<C extends ChunkTypeId>(chunk: ChunkTypeMap[C], i: number): ChunkItemTypeMap[C] {
    return chunk[i] as ChunkItemTypeMap[C]
}
export function areChunksEqual<C extends ChunkTypeId>(left: ChunkTypeMap[C], right: ChunkTypeMap[C]): boolean {
    return typeof left === 'string' || typeof right === 'string'
        ? left === right
        : Math.abs(left.length - right.length) < 0.5 &&
            left.every((byte, i) => Math.abs(byte - right[i]) < 0.5)
}
