import { ChunkTypeId, ChunkItemTypeMap, SimpleOperator } from '..'

export function readWhile<C extends ChunkTypeId = 'text'>(
    condition: (item: ChunkItemTypeMap[C]) => boolean,
    limit?: number | null
): SimpleOperator<C, 'readWhile'> {
    return {
        id: 'readWhile',
        args: {condition, limit: limit ?? null}
    } as SimpleOperator<C, 'readWhile'>
}
