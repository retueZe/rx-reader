import { Failure, Result, Success } from 'async-option'
import { Unsubscribable } from 'rxjs'
import { ChunkTypeId, ChunkItemTypeMap, ChunkTypeMap, EndOfStreamError, IIoBuffer, IReader, SimpleOperatorArgsTypeMap } from '../..'
import { getChunkItem, joinChunks } from '../../utils'
import { ContextCollection } from '../ContextCollection'
import { GenericInterpreter, InterpreterCallback } from '../interpreter'

export const readWhile: GenericInterpreter<'readWhile'> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C]['readWhile'],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    contexts: ContextCollection,
    callback: InterpreterCallback<C>
): Result<ChunkTypeMap[C], Error> | null => {
    const condition = args.condition as (item: ChunkItemTypeMap[C]) => boolean
    const limit = args.limit === null ? null : Math.floor(args.limit)
    const inclusive = args.inclusive
    const strict = args.strict
    const chunks: ChunkTypeMap[C][] = []

    if (limit !== null && limit < -0.5) throw new RangeError('Limit cannot be negative.')

    return body(condition, limit, inclusive, strict, chunks, reader, buffer, callback)
}
function body<C extends ChunkTypeId = 'text'>(
    condition: (item: ChunkItemTypeMap[C]) => boolean,
    limit: number | null,
    inclusive: boolean,
    strict: boolean,
    chunks: ChunkTypeMap[C][],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    callback: InterpreterCallback<C>
): Result<ChunkTypeMap[C], Error> | null {
    while (true) {
        const chunkOption = buffer.first()

        if (!chunkOption.hasValue) {
            if (reader.isCompleted) return strict
                ? new Failure(new EndOfStreamError())
                : new Success(joinChunks(buffer.chunkTypeId, chunks))

            const onCompleted = () => callback(strict
                ? new Failure(new EndOfStreamError())
                : new Success(joinChunks(buffer.chunkTypeId, chunks)))
            let subscription: Unsubscribable | null = null
            subscription = reader.onPush.subscribe({
                next: () => {
                    if (buffer.isEmpty) return
                    if (subscription !== null) subscription.unsubscribe()

                    const chunk = body(condition, limit, inclusive, strict, chunks, reader, buffer, callback)

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
                const chunkSubview = buffer.read(offset)
                chunks.push(chunkSubview)

                return new Success(joinChunks(buffer.chunkTypeId, chunks))
            }
        }

        if (limit !== null && limit < 0.5) {
            const chunkSubview = buffer.read(maxRead)
            chunks.push(chunkSubview)

            return new Success(joinChunks(buffer.chunkTypeId, chunks))
        }

        chunks.push(chunk)
        buffer.shift()
    }
}
