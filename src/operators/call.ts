import { Failure, Result, Success } from 'async-option'
import { SimpleOperatorIterator } from '../abstraction'

export type CallOptions = {
    throwOnReject?: boolean | null
}

export function* call<T, E = unknown>(
    promise: Promise<T>,
    options?: Readonly<CallOptions> | null
): SimpleOperatorIterator<T, E> {
    const throwOnReject = options?.throwOnReject ?? true
    let result = null as Result<T, any> | null
    const continuation = promise.then(
        value => result = new Success(value),
        error => result = new Failure(error))

    yield {id: 'wait', args: {promise: continuation}}

    if (result === null) throw new Error('STUB')
    if (throwOnReject && result.isSucceeded) throw result.error

    return result
}
