import { Failure, Result, Success } from 'async-option'
import type { Unsubscribable } from 'rxjs'
import type { ChunkTypeId, ChunkItemTypeMap, ChunkTypeMap, IIoBuffer, IReader, SimpleOperatorArgsTypeMap } from '../../index.js'
// preventing circular dependency
import { EndOfStreamError } from '../../EndOfStreamError.js'
import { createHollowChunk, getChunkItem } from '../../utils/index.js'
import type { ContextCollection } from '../ContextCollection.js'
import type { GenericInterpreter, InterpreterCallback } from '../interpreter.js'

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

    return body(condition, limit, inclusive, strict, 0, reader, buffer, callback)
}
function body<C extends ChunkTypeId = 'text'>(
    condition: (item: ChunkItemTypeMap[C]) => boolean,
    limit: number | null,
    inclusive: boolean,
    strict: boolean,
    skipped: number,
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    callback: InterpreterCallback<C>
): Result<ChunkTypeMap[C], Error> | null {
    while (true) {
        const chunkOption = buffer.first()

        if (!chunkOption.hasValue) {
            if (reader.isCompleted) return strict
                ? new Failure(new EndOfStreamError())
                : new Success(createHollowChunk<C>(skipped))

            const onCompleted = () => callback(strict
                ? new Failure(new EndOfStreamError())
                : new Success(createHollowChunk<C>(skipped)))
            let subscription: Unsubscribable | null = null
            subscription = reader.push.subscribe({
                next: () => {
                    if (buffer.isEmpty) return
                    if (subscription !== null) subscription.unsubscribe()

                    const chunk = body(condition, limit, inclusive, strict, skipped, reader, buffer, callback)

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
                skipped += buffer.skip(offset)

                return new Success(createHollowChunk<C>(skipped))
            }
        }

        if (limit !== null && limit < 0.5) {
            skipped += buffer.skip(maxRead)

            return new Success(createHollowChunk<C>(skipped))
        }

        skipped += chunk.length
        buffer.shift()
    }
}
