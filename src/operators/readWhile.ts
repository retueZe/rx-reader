import { ChunkTypeId, ChunkItemTypeMap, SimpleOperator } from '..'

export type ReadWhileOptions = {
    limit?: number | null
    inclusive?: boolean | null
}

export function readWhile<C extends ChunkTypeId = 'text'>(
    condition: (item: ChunkItemTypeMap[C]) => boolean,
    options?: Readonly<ReadWhileOptions> | null
): SimpleOperator<C, 'readWhile'> {
    return {
        id: 'readWhile',
        args: {
            condition,
            limit: options?.limit ?? null,
            inclusive: options?.inclusive ?? false
        }
    } as SimpleOperator<C, 'readWhile'>
}
