import type { SimpleOperator } from '../abstraction'

export function read(count?: number | null): SimpleOperator<'read'> {
    return {
        id: 'read',
        args: {count: count ?? null}
    }
}
