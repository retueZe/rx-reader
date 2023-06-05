import { Failure, Result, Success } from 'async-option'
import { ChunkTypeId, SimpleOperatorIterator } from '../abstraction'
import { wait } from './wait'

export type CallOptions = {
    throwOnReject?: boolean | null
}

export function* call<T, E = unknown, C extends ChunkTypeId = 'text'>(
    promise: Promise<T>,
    options?: Readonly<CallOptions> | null
): SimpleOperatorIterator<T, E, C> {
    const throwOnReject = options?.throwOnReject ?? true
    let result = null as Result<T, any> | null
    const continuation = promise.then(
        value => result = new Success(value),
        error => result = new Failure(error))

    yield wait(continuation)

    if (result === null) throw new Error('STUB')
    if (!result.isSucceeded) throw throwOnReject
        ? result.error
        : result

    return result.value
}
