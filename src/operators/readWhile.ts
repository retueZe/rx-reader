import type { ChunkTypeId, ChunkItemTypeMap, SimpleOperator } from '../index.js'

/** @since v1.0.0 */
export type ReadWhileOptions = {
    /**
     * Determines the maximum number of items can be matched.
     * @default null
     * @since v1.0.0
     */
    limit?: number | null
    /**
     * If `true`, includes the terminating item into the read chunk.
     * @default false
     * @since v1.0.0
     */
    inclusive?: boolean | null
    /**
     * If `true`, throws an `EndOfStreamError` error once the stream ends; otherwise, completes reading successfully.
     * @default true
     * @since v1.0.0
     */
    strict?: boolean | null
}

/** @since v1.0.0 */
export function readWhile<C extends ChunkTypeId = 'text'>(
    condition: (item: ChunkItemTypeMap[C]) => boolean,
    options?: Readonly<ReadWhileOptions> | null
): SimpleOperator<C, 'readWhile'> {
    return {
        id: 'readWhile',
        args: {
            condition,
            limit: options?.limit ?? null,
            inclusive: options?.inclusive ?? false,
            strict: options?.strict ?? true
        }
    } as SimpleOperator<C, 'readWhile'>
}
