import type { SimpleOperator } from '../abstraction'

export function skip(count?: number | null): SimpleOperator<'skip'> {
    return {
        id: 'skip',
        args: {count: count ?? null}
    }
}
