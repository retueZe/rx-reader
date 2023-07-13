import type { ChunkTypeId, ChunkTypeMap, IIoBuffer, IReader, SimpleOperatorArgsTypeMap } from '../../index.js'
import type { GenericInterpreter, InterpreterCallback } from '../interpreter.js'
import { Result, Success } from 'async-option'
import { getEmptyChunk } from '../../utils/index.js'
import type { ContextCollection } from '../ContextCollection.js'

export const wait: GenericInterpreter<'wait'> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C]['wait'],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    contexts: ContextCollection,
    callback: InterpreterCallback<C>
): Result<ChunkTypeMap[C], Error> | null => {
    const thenCallback = (): void => {
        callback(new Success(getEmptyChunk(buffer.chunkTypeId)))
    }
    args.promise.then(thenCallback, thenCallback)

    return null
}
