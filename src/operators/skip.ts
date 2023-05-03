import type { ChunkTypeId, SimpleOperator } from '../abstraction'

export function skip(count?: number | null): SimpleOperator<ChunkTypeId, 'skip'> {
    return {
        id: 'skip',
        args: {count: count ?? null}
    }
}
