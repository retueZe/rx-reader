import type { SimpleOperator } from '..'

export function peek(count?: number | null): SimpleOperator<'peek'> {
    return {
        id: 'peek',
        args: {count: count ?? null}
    }
}
