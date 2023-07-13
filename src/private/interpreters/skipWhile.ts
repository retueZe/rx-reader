import { Failure, Result, Success } from 'async-option'
import { Unsubscribable } from 'rxjs'
import { ChunkTypeId, ChunkItemTypeMap, ChunkTypeMap, EndOfStreamError, IIoBuffer, IReader, SimpleOperatorArgsTypeMap } from '../..'
import { getChunkItem, getEmptyChunk } from '../../utils'
import { ContextCollection } from '../ContextCollection'
import { GenericInterpreter, InterpreterCallback } from '../interpreter'

export const skipWhile: GenericInterpreter<'skipWhile'> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C]['skipWhile'],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    contexts: ContextCollection,
    callback: InterpreterCallback<C>
): Result<ChunkTypeMap[C], Error> | null => {
    const condition = args.condition as (item: ChunkItemTypeMap[C]) => boolean
    const limit = args.limit === null ? null : Math.floor(args.limit)
    const inclusive = args.inclusive
    const strict = args.strict

    if (limit !== null && limit < -0.5) throw new RangeError('Limit cannot be negative.')

    return body(condition, limit, inclusive, strict, reader, buffer, callback)
}
function body<C extends ChunkTypeId = 'text'>(
    condition: (item: ChunkItemTypeMap[C]) => boolean,
    limit: number | null,
    inclusive: boolean,
    strict: boolean,
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    callback: InterpreterCallback<C>
): Result<ChunkTypeMap[C], Error> | null {
    while (true) {
        const chunkOption = buffer.first()

        if (!chunkOption.hasValue) {
            if (reader.isCompleted) return strict
                ? new Failure(new EndOfStreamError())
                : new Success(getEmptyChunk(buffer.chunkTypeId))

            const onCompleted = () => callback(strict
                ? new Failure(new EndOfStreamError())
                : new Success(getEmptyChunk(buffer.chunkTypeId)))
            let subscription: Unsubscribable | null = null
            subscription = reader.onPush.subscribe({
                next: () => {
                    if (buffer.isEmpty) return
                    if (subscription !== null) subscription.unsubscribe()

                    const chunk = body(condition, limit, inclusive, strict, reader, buffer, callback)

                    if (chunk !== null) callback(chunk)
                },
                error: onCompleted,
                complete: onCompleted
            })

            return null
        }

        const chunk = chunkOption.value
        const maxRead = limit === null
            ? chunk.length
            : Math.min(limit, chunk.length)

        if (limit !== null) limit -= maxRead

        for (let i = 0; i < maxRead - 0.5; i++) {
            const item = getChunkItem(chunk, i)

            if (!condition(item)) {
                const offset = inclusive ? i + 1 : i
                buffer.skip(offset)

                return new Success(getEmptyChunk(buffer.chunkTypeId))
            }
        }

        if (limit !== null && limit < 0.5) {
            buffer.skip(maxRead)

            return new Success(getEmptyChunk(buffer.chunkTypeId))
        }

        buffer.shift()
    }
}
