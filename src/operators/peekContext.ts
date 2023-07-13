import { Failure, NONE, Option } from 'async-option'
import type { ChunkTypeId, ContextConstructor, SimpleOperator, SimpleOperatorIterator } from '../index.js'

/** @since v1.0.0 */
export function* peekContext<T, C extends ChunkTypeId = 'text'>(
    constructor: ContextConstructor<T>
): SimpleOperatorIterator<T, string, C> {
    const target: {context: Option<any>} = {context: NONE}

    yield {
        id: 'getContext',
        args: {
            constructor,
            mutable: false,
            retain: true,
            target
        }
    } as SimpleOperator<C, 'getContext'>

    // MAYBE: add `FailureError` or smth alike for avoid `as any`
    return target.context.get(() => new Failure('Context stack is empty.') as any)
}
