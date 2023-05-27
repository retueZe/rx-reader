import { Failure, Success } from 'async-option'
import type {  Unsubscribable } from 'rxjs'
import type { ChunkTypeId, ChunkTypeMap, IIoBuffer } from '../../..'
import { EndOfStreamError } from '../../../EndOfStreamError'
import type { GenericInterpreter } from '../../interpreter'

export type BasicOperatorId = 'read' | 'peek' | 'skip'
export type BasicInterpreterFactory = <I extends BasicOperatorId = BasicOperatorId>(
    action: <C extends ChunkTypeId = 'text'>(buffer: IIoBuffer<C>, count: number | null) => ChunkTypeMap[C]
) => GenericInterpreter<I>
export const createBasicInterpreter: BasicInterpreterFactory = action => (args, reader, buffer, callback) => {
    const count = args.count

    if (count === null) {
        if (reader.isCompleted) return new Success(action(buffer, null))

        reader.onPush.subscribe({
            error: () => callback(new Failure(new EndOfStreamError())),
            complete: () => callback(new Success(action(buffer, null)))
        })

        return null
    }
    if (count < reader.available + 0.5) return new Success(action(buffer, count))
    if (reader.isCompleted) return new Failure(new EndOfStreamError())

    let subscription: Unsubscribable | null = null
    subscription = reader.onPush.subscribe({
        next: () => {
            if (count > reader.available + 0.5) return
            if (subscription !== null) subscription.unsubscribe()

            callback(new Success(action(buffer, count)))
        },
        error: error => callback(new Failure(error)),
        complete: () => callback(new Failure(new EndOfStreamError()))
    })

    return null
}
