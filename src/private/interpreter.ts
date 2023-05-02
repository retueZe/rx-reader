import { ChunkTypeId, ChunkTypeMap, SimpleOperatorArgsTypeMap, SimpleOperatorId } from '../abstraction'
import { IoBuffer } from '../IoBuffer'
import { Reader } from '../Reader'
import { read } from './interpreters/read'

export type InterpreterCallback<C extends ChunkTypeId = 'text'> = (chunk: ChunkTypeMap[C]) => void
export type Interpreter<I extends SimpleOperatorId = SimpleOperatorId> =
    <C extends ChunkTypeId = 'text'>(
        args: SimpleOperatorArgsTypeMap[I],
        reader: Reader<C>,
        buffer: IoBuffer<C>,
        callback: InterpreterCallback<C>
    ) => ChunkTypeMap[C] | null
export type InterpreterMap = {
    [I in SimpleOperatorId]: Interpreter<I>
}
export const INTERPRETERS: Readonly<InterpreterMap> = {read}
