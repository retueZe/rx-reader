import type { ChunkTypeId, SimpleOperator, SimpleOperatorIterator } from '../index.js'

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
export function* skip<C extends ChunkTypeId = 'text'>(
    count?: number | null,
    options?: Readonly<SkipOptions> | null
): SimpleOperatorIterator<number, unknown, C> {
    const skipped = yield {
        id: 'skip',
        args: {
            count: count ?? null,
            strict: options?.strict ?? true
        }
    } as SimpleOperator<C, 'skip'>

    return skipped.length
}
