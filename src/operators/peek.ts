import type { ChunkTypeId, SimpleOperator } from '..'

export type PeekOptions = {
    strict?: boolean | null
}

export function peek<C extends ChunkTypeId = 'text'>(
    count?: number | null,
    options?: Readonly<PeekOptions> | null
): SimpleOperator<C, 'peek'> {
    return {
        id: 'peek',
        args: {
            count: count ?? null,
            strict: options?.strict ?? true
        }
    }
}
