import type { ChunkTypeId, ChunkTypeMap, IReader, SimpleOperatorArgsTypeMap } from '../../abstraction'
import { IIoBuffer } from '../../index'
import { GenericInterpreter } from '../interpreter'
import { Result, Success } from 'async-option'
import { getEmptyChunk } from '../../utils'
import { ContextCollection } from '../ContextCollection'

export const unsetContext: GenericInterpreter<'unsetContext'> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C]['unsetContext'],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    contexts: ContextCollection
): Result<ChunkTypeMap[C], Error> | null => {
    contexts.unset(args.constructor)

    return new Success(getEmptyChunk(buffer.chunkTypeId))
}
