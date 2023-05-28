import type { ChunkTypeId, SimpleOperator } from '../abstraction'

export type ReadOptions = {
    strict?: boolean | null
}

export function read<C extends ChunkTypeId = 'text'>(
    count?: number | null,
    options?: Readonly<ReadOptions> | null
): SimpleOperator<C, 'read'> {
    return {
        id: 'read',
        args: {
            count: count ?? null,
            strict: options?.strict ?? true
        },
    }
}
