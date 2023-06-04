import type { ChunkTypeId, ChunkTypeMap, IReader, SimpleOperatorArgsTypeMap } from '../../abstraction'
import { IIoBuffer } from '../../index'
import { GenericInterpreter, InterpreterCallback } from '../interpreter'
import { Result, Success } from 'async-option'
import { getEmptyChunk } from '../../utils'

export const wait: GenericInterpreter<'wait'> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C]['wait'],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    callback: InterpreterCallback<C>
): Result<ChunkTypeMap[C], Error> | null => {
    const thenCallback = (): void => {
        callback(new Success(getEmptyChunk(buffer.chunkTypeId)))
    }
    args.promise.then(thenCallback, thenCallback)

    return null
}
