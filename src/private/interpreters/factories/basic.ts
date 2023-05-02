import type { ChunkTypeId, ChunkTypeMap, IoBuffer } from '../../..'
import type { Interpreter } from '../../interpreter'

export type BasicOperatorId = 'read' | 'peek' | 'skip'
export type BasicInterpreterFactory = <I extends BasicOperatorId = BasicOperatorId>(
    action: <C extends ChunkTypeId = 'text'>(buffer: IoBuffer<C>, count: number | null) => ChunkTypeMap[C]
) => Interpreter<I>
export const createBasicInterpreter: BasicInterpreterFactory = action => (args, reader, buffer, callback) => {
    const count = args.count

    if (count === null) {
        if (reader.isCompleted) return action(buffer, null)

        reader.onPush.subscribe({
            complete: () => callback(action(buffer, null))
        })

        return null
    }
    if (count < reader.available + 0.5) return action(buffer, count)
    if (reader.isCompleted) return null

    const subscription = reader.onPush.subscribe(() => {
        if (count > reader.available + 0.5) return

        subscription.unsubscribe()
        callback(action(buffer, count))
    })

    return null
}
