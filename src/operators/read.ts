import type { ChunkTypeId, SimpleOperator } from '../abstraction'

/** @since v1.0.0 */
export type ReadOptions = {
    /**
     * If `true`, matches exact count of items; otherwise `count` works as limit.
     * @default true
     * @since v1.0.0
     */
    strict?: boolean | null
}

/** @since v1.0.0 */
export function read<C extends ChunkTypeId = 'text'>(
    count?: number | null,
    options?: Readonly<ReadOptions> | null
): SimpleOperator<C, 'read'> {
    return {
        id: 'read',
        args: {
            count: count ?? null,
            strict: options?.strict ?? true
        }
    }
}
