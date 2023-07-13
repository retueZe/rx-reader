import type { Result } from 'async-option'
import type { ChunkTypeId, ChunkTypeMap, GenericOperatorId, IIoBuffer, IReader, SimpleOperatorArgsTypeMap, SimpleOperatorId } from '../index.js'
import { ContextCollection } from './ContextCollection.js'
import { read, readWhile, peek, peekWhile, skip, skipWhile, wait, pushContext, setContext, unsetContext, getContext, isCompleted } from './interpreters/index.js'

export type InterpreterCallback<C extends ChunkTypeId = 'text'> = (chunk: Result<ChunkTypeMap[C], Error>) => void
export type Interpreter<C extends ChunkTypeId = 'text', I extends SimpleOperatorId[C] = SimpleOperatorId[C]> = (
    args: SimpleOperatorArgsTypeMap[C][I],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    contexts: ContextCollection,
    callback: InterpreterCallback<C>
) => Result<ChunkTypeMap[C], Error> | null
export type GenericInterpreter<I extends GenericOperatorId = GenericOperatorId> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C][I],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    contexts: ContextCollection,
    callback: InterpreterCallback<C>
) => Result<ChunkTypeMap[C], Error> | null
export type InterpreterMap = {
    [C in ChunkTypeId]: {
        [I in SimpleOperatorId[C]]: Interpreter<C, I>
    }
}
export const INTERPRETERS: Readonly<InterpreterMap> = {
    'text': {read, readWhile, peek, peekWhile, skip, skipWhile, wait, pushContext, setContext, unsetContext, getContext, isCompleted},
    'binary': {read, readWhile, peek, peekWhile, skip, skipWhile, wait, pushContext, setContext, unsetContext, getContext, isCompleted}
}
