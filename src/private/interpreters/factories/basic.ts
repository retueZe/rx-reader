import { Failure, Success } from 'async-option'
import type {  Unsubscribable } from 'rxjs'
import type { ChunkTypeId, ChunkTypeMap, IIoBuffer } from '../../../index.js'
// preventing circular dependency
import { EndOfStreamError } from '../../../EndOfStreamError.js'
import type { GenericInterpreter } from '../../interpreter.js'

export type BasicOperatorId = 'read' | 'peek' | 'skip'
export type BasicInterpreterFactory = <I extends BasicOperatorId = BasicOperatorId>(
    action: <C extends ChunkTypeId = 'text'>(buffer: IIoBuffer<C>, count: number | null) => ChunkTypeMap[C]
) => GenericInterpreter<I>
export const createBasicInterpreter: BasicInterpreterFactory = action => (args, reader, buffer, contexts, callback) => {
    const count = args.count
    const strict = args.strict

    if (count === null) {
        if (reader.isCompleted) return new Success(action(buffer, null))

        reader.push.subscribe({
            error: () => callback(new Failure(new EndOfStreamError())),
            complete: () => callback(new Success(action(buffer, null)))
        })

        return null
    }
    if (count < buffer.available + 0.5) return new Success(action(buffer, count))
    if (reader.isCompleted) return strict
        ? new Failure(new EndOfStreamError())
        : new Success(action(buffer, null))

    let subscription: Unsubscribable | null = null
    subscription = reader.push.subscribe({
        next: () => {
            if (count > buffer.available + 0.5) return
            if (subscription !== null) subscription.unsubscribe()

            callback(new Success(action(buffer, count)))
        },
        error: error => callback(new Failure(error)),
        complete: () => callback(strict
            ? new Failure(new EndOfStreamError())
            : new Success(action(buffer, null)))
    })

    return null
}
