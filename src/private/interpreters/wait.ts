import type { ChunkTypeId, ChunkTypeMap, IReader, SimpleOperatorArgsTypeMap } from '../../abstraction'
import type { IIoBuffer } from '../../IoBuffer'
import type { GenericInterpreter, InterpreterCallback } from '../interpreter'
import { Result, Success } from 'async-option'
import { getEmptyChunk } from '../../utils'
import { ContextCollection } from '../ContextCollection'

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
