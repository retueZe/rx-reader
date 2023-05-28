import type { ChunkTypeId, ChunkItemTypeMap, SimpleOperator } from '..'

/** @since v1.0.0 */
export type PeekWhileOptions = {
    /**
     * Determines the maximum number of items can be matched.
     * @default null
     * @since v1.0.0
     */
    limit?: number | null
    /**
     * If `true`, includes the terminating item into the peeked chunk.
     * @default false
     * @since v1.0.0
     */
    inclusive?: boolean | null
}

/** @since v1.0.0 */
export function peekWhile<C extends ChunkTypeId = 'text'>(
    condition: (item: ChunkItemTypeMap[C]) => boolean,
    options?: Readonly<PeekWhileOptions> | null
): SimpleOperator<C, 'peekWhile'> {
    return {
        id: 'peekWhile',
        args: {
            condition,
            limit: options?.limit ?? null,
            inclusive: options?.inclusive ?? false
        }
    } as SimpleOperator<C, 'peekWhile'>
}
