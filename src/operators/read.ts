import type { ChunkTypeId, SimpleOperator } from '../abstraction'

export function read(count?: number | null): SimpleOperator<ChunkTypeId, 'read'> {
    return {
        id: 'read',
        args: {count: count ?? null}
    }
}
