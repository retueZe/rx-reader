import type { ChunkTypeId, ChunkTypeMap, IReader, SimpleOperatorArgsTypeMap } from '../../index.js'
import type { GenericInterpreter } from '../interpreter.js'
import { Result, Success } from 'async-option'
import { createHollowChunk } from '../../utils/index.js'

export const isCompleted: GenericInterpreter<'isCompleted'> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C]['isCompleted'],
    reader: IReader<C>
): Result<ChunkTypeMap[C], never> | null => {
    return new Success(createHollowChunk<C>(reader.isCompleted ? 1 : 0))
}
