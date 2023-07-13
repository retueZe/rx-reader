import type { ChunkTypeId, ChunkTypeMap, IIoBuffer, IReader, SimpleOperatorArgsTypeMap } from '../../index.js'
import type { GenericInterpreter } from '../interpreter.js'
import { Result, Success } from 'async-option'
import { getEmptyChunk } from '../../utils/index.js'
import type { ContextCollection } from '../ContextCollection.js'

export const unsetContext: GenericInterpreter<'unsetContext'> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C]['unsetContext'],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    contexts: ContextCollection
): Result<ChunkTypeMap[C], Error> | null => {
    contexts.unset(args.constructor)

    return new Success(getEmptyChunk(buffer.chunkTypeId))
}
