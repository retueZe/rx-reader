import type { ChunkTypeId, ContextConstructor, SimpleOperator } from '../index.js'

/** @since v1.0.0 */
export function unsetContext<C extends ChunkTypeId = 'text'>(
    constructor: ContextConstructor
): SimpleOperator<C, 'unsetContext'> {
    return {
        id: 'unsetContext',
        args: {constructor}
    }
}
