import type { ChunkTypeId, SimpleOperator } from '../index.js'

/** @since v1.0.0 */
export function pushContext<C extends ChunkTypeId = 'text'>(context: any): SimpleOperator<C, 'pushContext'> {
    return {
        id: 'pushContext',
        args: {context}
    }
}
