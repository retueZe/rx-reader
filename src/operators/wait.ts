import type { ChunkTypeId, SimpleOperator } from '../abstraction'

/** @since v1.0.0 */
export function wait<C extends ChunkTypeId = 'text'>(promise: Promise<any>): SimpleOperator<C, 'wait'> {
    return {
        id: 'wait',
        args: {promise}
    }
}
