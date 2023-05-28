import type { ChunkTypeId, SimpleOperator } from '../abstraction'

export type SkipOptions = {
    strict?: boolean | null
}

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
