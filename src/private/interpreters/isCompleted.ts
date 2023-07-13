import type { ChunkTypeId, ChunkTypeMap, IReader, SimpleOperatorArgsTypeMap } from '../../abstraction'
import { GenericInterpreter } from '../interpreter'
import { Result, Success } from 'async-option'
import { createHollowChunk } from '../../utils'

export const isCompleted: GenericInterpreter<'isCompleted'> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C]['isCompleted'],
    reader: IReader<C>
): Result<ChunkTypeMap[C], never> | null => {
    return new Success(createHollowChunk<C>(reader.isCompleted ? 1 : 0))
}
