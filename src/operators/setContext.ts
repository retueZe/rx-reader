import type { ChunkTypeId, SimpleOperator } from '../index.js'

/** @since v1.0.0 */
export function setContext<C extends ChunkTypeId = 'text'>(context: any): SimpleOperator<C, 'setContext'> {
    return {
        id: 'setContext',
        args: {context}
    }
}
