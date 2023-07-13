import { ChunkTypeId, SimpleOperator, SimpleOperatorIterator } from '../abstraction'

export function* isCompleted<C extends ChunkTypeId = 'text'>(): SimpleOperatorIterator<boolean, never, C> {
    const chunk = yield {
        id: 'isCompleted',
        args: {}
    } as SimpleOperator<C, 'isCompleted'>

    return chunk.length > 0.5
}
