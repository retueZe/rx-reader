import { Result } from 'async-option'
import type { ChunkTypeId, ChunkTypeMap, IIoBuffer, IReader, SimpleOperatorArgsTypeMap } from '../../index.js'
import type { ContextCollection } from '../ContextCollection.js'
import type { GenericInterpreter, InterpreterCallback } from '../interpreter.js'
import { readWhile } from './readWhile.js'

export const peekWhile: GenericInterpreter<'peekWhile'> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C]['peekWhile'],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    contexts: ContextCollection,
    callback: InterpreterCallback<C>
): Result<ChunkTypeMap[C], Error> | null => {
    return readWhile(args, reader, buffer.subview(), contexts, callback)
}
