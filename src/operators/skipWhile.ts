import type { ChunkTypeId, ChunkItemTypeMap, SimpleOperator } from '..'

export type SkipWhileOptions = {
    limit?: number | null
    inclusive?: boolean | null
}

export function skipWhile<C extends ChunkTypeId = 'text'>(
    condition: (item: ChunkItemTypeMap[C]) => boolean,
    options?: Readonly<SkipWhileOptions> | null
): SimpleOperator<C, 'skipWhile'> {
    return {
        id: 'skipWhile',
        args: {
            condition,
            limit: options?.limit ?? null,
            inclusive: options?.inclusive ?? false
        }
    } as SimpleOperator<C, 'skipWhile'>
}
