import type { Result } from 'async-option'
import type { ChunkTypeId, ChunkTypeMap, GenericOperatorId, IIoBuffer, IReader, SimpleOperatorArgsTypeMap, SimpleOperatorId } from '..'
import { read, readWhile, peek, peekWhile, skip, skipWhile, wait } from './interpreters'

export type InterpreterCallback<C extends ChunkTypeId = 'text'> = (chunk: Result<ChunkTypeMap[C], Error>) => void
export type Interpreter<C extends ChunkTypeId = 'text', I extends SimpleOperatorId[C] = SimpleOperatorId[C]> = (
    args: SimpleOperatorArgsTypeMap[C][I],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    callback: InterpreterCallback<C>
) => Result<ChunkTypeMap[C], Error> | null
export type GenericInterpreter<I extends GenericOperatorId = GenericOperatorId> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C][I],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    callback: InterpreterCallback<C>
) => Result<ChunkTypeMap[C], Error> | null
export type InterpreterMap = {
    [C in ChunkTypeId]: {
        [I in SimpleOperatorId[C]]: Interpreter<C, I>
    }
}
export const INTERPRETERS: Readonly<InterpreterMap> = {
    'text': {read, readWhile, peek, peekWhile, skip, skipWhile, wait},
    'binary': {read, readWhile, peek, peekWhile, skip, skipWhile, wait}
}
