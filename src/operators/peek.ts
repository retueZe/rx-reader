import type { ChunkTypeId, SimpleOperator } from '..'

export function peek(count?: number | null): SimpleOperator<ChunkTypeId, 'peek'> {
    return {
        id: 'peek',
        args: {count: count ?? null}
    }
}
