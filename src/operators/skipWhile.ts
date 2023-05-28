import type { ChunkTypeId, ChunkItemTypeMap, SimpleOperator } from '..'

/** @since v1.0.0 */
export type SkipWhileOptions = {
    /**
     * Determines the maximum number of items can be matched.
     * @default null
     * @since v1.0.0
     */
    limit?: number | null
    /**
     * If `true`, also skips the terminating item.
     * @default false
     * @since v1.0.0
     */
    inclusive?: boolean | null
}

/** @since v1.0.0 */
export function skipWhile<C extends ChunkTypeId = 'text'>(
    condition: (item: ChunkItemTypeMap[C]) => boolean,
    options?: Readonly<SkipWhileOptions> | null
): SimpleOperator<C, 'skipWhile'> {
    return {
        id: 'skipWhile',
        args: {
            condition,
            limit: options?.limit ?? null,
            inclusive: options?.inclusive ?? false
        }
    } as SimpleOperator<C, 'skipWhile'>
}
