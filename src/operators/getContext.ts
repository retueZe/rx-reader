import { Failure, NONE, Option } from 'async-option'
import type { ChunkTypeId, ContextConstructor, SimpleOperatorIterator } from '../index.js'

/** @since v1.0.0 */
export function* getContext<T, C extends ChunkTypeId = 'text'>(
    constructor: ContextConstructor<T>
): SimpleOperatorIterator<T, string, C> {
    const target: {context: Option<any>} = {context: NONE}

    // TODO: wtf?
    yield {id: 'getContext', args: {constructor, mutable: true, retain: false, target}} as any

    return target.context.get(() => new Failure('Context not found.') as any)
}
