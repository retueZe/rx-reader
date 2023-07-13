import { NONE, Option } from 'async-option'
import type { ChunkTypeId, ContextConstructor, SimpleOperatorIterator } from '../index.js'

/** @since v1.0.0 */
export function* popContext<T, C extends ChunkTypeId = 'text'>(
    constructor: ContextConstructor<T>
): SimpleOperatorIterator<T, never, C> {
    const target: {context: Option<any>} = {context: NONE}

    // TODO: wtf?
    yield {id: 'getContext', args: {constructor, mutable: false, retain: false, target}} as any

    return target.context.get(() => new Error('STUB'))
}
