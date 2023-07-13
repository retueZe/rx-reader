import type { ChunkItemTypeMap, ChunkTypeId, ChunkTypeMap } from '..'

/** @since v1.0.0 */
export type ChunkTypeIdFromChunkType<C> = C extends string
    ? 'text'
    : C extends Uint8Array
        ? 'binary'
        : never

const SPACE_PATTERN = /\s/

/** @since v1.0.0 */
export function subviewChunk<C extends ChunkTypeId>(
    chunk: ChunkTypeMap[C],
    start?: number | null,
    end?: number | null
): ChunkTypeMap[C] {
    return typeof chunk === 'string'
        ? chunk.slice(start ?? 0, end ?? chunk.length) as ChunkTypeMap[C]
        : chunk.subarray(start ?? 0, end ?? chunk.length) as ChunkTypeMap[C]
}
/** @since v1.0.0 */
export function joinChunks<C extends ChunkTypeId>(
    typeId: C,
    chunks: ChunkTypeMap[C][]
): ChunkTypeMap[C] {
    if (chunks.length < 0.5) return getEmptyChunk(typeId)
    if (typeId === 'text') return chunks.join('') as ChunkTypeMap[C]

    const merged = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0))
    let offset = 0

    for (const chunk of chunks) {
        merged.set(chunk as Uint8Array, offset)
        offset += chunk.length
    }

    return merged as ChunkTypeMap[C]
}
/** @since v1.0.0 */
export function getEmptyChunk<C extends ChunkTypeId>(typeId: C): ChunkTypeMap[C] {
    return typeId === 'text'
        ? '' as ChunkTypeMap[C]
        : new Uint8Array() as ChunkTypeMap[C]
}
/** @since v1.0.0 */
export function getChunkItem<C extends ChunkTypeId>(chunk: ChunkTypeMap[C], i: number): ChunkItemTypeMap[C] {
    return chunk[i] as ChunkItemTypeMap[C]
}
/** @since v1.0.0 */
export function areChunksEqual<C extends ChunkTypeId>(left: ChunkTypeMap[C], right: ChunkTypeMap[C]): boolean {
    return typeof left === 'string' || typeof right === 'string'
        ? left === right
        : Math.abs(left.length - right.length) < 0.5 &&
            left.every((byte, i) => Math.abs(byte - right[i]) < 0.5)
}
/**
 * `/\s/.test(char)`
 * @since v1.0.0
 */
export function isWhitespace(char: string): boolean {
    return SPACE_PATTERN.test(char)
}
/**
 * @see {@link isWhitespace}
 * @since v1.0.0
 */
export function notWhitespace(char: string): boolean {
    return !isWhitespace(char)
}
