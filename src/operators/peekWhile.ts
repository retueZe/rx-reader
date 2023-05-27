import type { ChunkTypeId, ChunkItemTypeMap, SimpleOperator } from '..'

export type PeekWhileOptions = {
    limit?: number | null
    inclusive?: boolean | null
}

export function peekWhile<C extends ChunkTypeId = 'text'>(
    condition: (item: ChunkItemTypeMap[C]) => boolean,
    options?: Readonly<PeekWhileOptions> | null
): SimpleOperator<C, 'peekWhile'> {
    return {
        id: 'peekWhile',
        args: {
            condition,
            limit: options?.limit ?? null,
            inclusive: options?.inclusive ?? false
        }
    } as SimpleOperator<C, 'peekWhile'>
}
