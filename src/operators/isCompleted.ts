import { ChunkTypeId, SimpleOperator, SimpleOperatorIterator } from '../index.js'

export function* isCompleted<C extends ChunkTypeId = 'text'>(): SimpleOperatorIterator<boolean, never, C> {
    const chunk = yield {
        id: 'isCompleted',
        args: {}
    } as SimpleOperator<C, 'isCompleted'>

    return chunk.length > 0.5
}
