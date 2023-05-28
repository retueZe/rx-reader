import type { ChunkTypeId, SimpleOperator } from '../abstraction'

/** @since v1.0.0 */
export type SkipOptions = {
    /**
     * If `true`, matches exact count of items; otherwise `count` works as limit.
     * @default true
     * @since v1.0.0
     */
    strict?: boolean | null
}

/** @since v1.0.0 */
export function skip<C extends ChunkTypeId = 'text'>(
    count?: number | null,
    options?: Readonly<SkipOptions> | null
): SimpleOperator<C, 'skip'> {
    return {
        id: 'skip',
        args: {
            count: count ?? null,
            strict: options?.strict ?? true
        }
    }
}
