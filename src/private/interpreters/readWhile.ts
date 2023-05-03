import { Failure, Result, Success } from 'async-option'
import { Unsubscribable } from 'rxjs'
import { ChunkTypeId, ChunkItemTypeMap, ChunkTypeMap, IoBuffer, IReader, SimpleOperatorArgsTypeMap } from '../..'
import { EndOfStreamError } from '../../EndOfStreamError'
import { getChunkItem, joinChunks } from '../../utils/chunk'
import { GenericInterpreter, InterpreterCallback } from '../interpreter'

export const readWhile: GenericInterpreter<'readWhile'> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C]['readWhile'],
    reader: IReader<C>,
    buffer: IoBuffer<C>,
    callback: InterpreterCallback<C>
): Result<ChunkTypeMap[C], Error> | null => {
    const condition = args.condition as (item: ChunkItemTypeMap[C]) => boolean
    const limit = args.limit
    const chunks: ChunkTypeMap[C][] = []

    return body(condition, limit, chunks, reader, buffer, callback)
}
function body<C extends ChunkTypeId = 'text'>(
    condition: (item: ChunkItemTypeMap[C]) => boolean,
    limit: number | null,
    chunks: ChunkTypeMap[C][],
    reader: IReader<C>,
    buffer: IoBuffer<C>,
    callback: InterpreterCallback<C>
): Result<ChunkTypeMap[C], Error> | null {
    while (true) {
        const chunkOption = buffer.first()

        if (!chunkOption.hasValue) {
            if (reader.isCompleted) return new Failure(new EndOfStreamError())

            let subscription: Unsubscribable | null = null
            subscription = reader.onPush.subscribe(() => {
                if (buffer.isEmpty) return
                if (subscription !== null) subscription.unsubscribe()

                const chunk = body(condition, limit, chunks, reader, buffer, callback)

                if (chunk !== null) callback(chunk)
            })

            return null
        }

        const chunk = chunkOption.value

        for (let i = 0; i < chunk.length - 0.5; i++) {
            const item = getChunkItem(chunk, i)

            if (!condition(item)) {
                const chunkSubview = buffer.read(i)
                chunks.push(chunkSubview)

                return new Success(joinChunks(chunks[0], ...chunks.slice(1)))
            }
        }

        chunks.push(chunk)
        buffer.shift()
    }
}
