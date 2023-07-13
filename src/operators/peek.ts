import type { ChunkTypeId, SimpleOperator } from '../index.js'

/** @since v1.0.0 */
export type PeekOptions = {
    /**
     * If `true`, matches exact count of items; otherwise `count` works as limit.
     * @default true
     * @since v1.0.0
     */
    strict?: boolean | null
}

/** @since v1.0.0 */
export function peek<C extends ChunkTypeId = 'text'>(
    count?: number | null,
    options?: Readonly<PeekOptions> | null
): SimpleOperator<C, 'peek'> {
    return {
        id: 'peek',
        args: {
            count: count ?? null,
            strict: options?.strict ?? true
        }
    }
}
