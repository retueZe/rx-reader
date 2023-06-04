import { Result } from 'async-option'
import { ChunkTypeId, ChunkTypeMap, IIoBuffer, IReader, SimpleOperatorArgsTypeMap } from '../..'
import { ContextCollection } from '../ContextCollection'
import { GenericInterpreter, InterpreterCallback } from '../interpreter'
import { readWhile } from './readWhile'

export const peekWhile: GenericInterpreter<'peekWhile'> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C]['peekWhile'],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    contexts: ContextCollection,
    callback: InterpreterCallback<C>
): Result<ChunkTypeMap[C], Error> | null => {
    return readWhile(args, reader, buffer.subview(), contexts, callback)
}
