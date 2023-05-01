import type { SimpleOperator } from '../abstraction'

export function read(count: number): SimpleOperator<'read'> {
    return {
        id: 'read',
        args: {count}
    }
}
