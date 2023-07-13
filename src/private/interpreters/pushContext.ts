import type { ChunkTypeId, ChunkTypeMap, IReader, SimpleOperatorArgsTypeMap } from '../../abstraction'
import type { IIoBuffer } from '../../IoBuffer'
import type { GenericInterpreter } from '../interpreter'
import { Result, Success } from 'async-option'
import { getEmptyChunk } from '../../utils'
import { ContextCollection } from '../ContextCollection'

export const pushContext: GenericInterpreter<'pushContext'> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C]['pushContext'],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    contexts: ContextCollection
): Result<ChunkTypeMap[C], Error> | null => {
    contexts.push(args.context)

    return new Success(getEmptyChunk(buffer.chunkTypeId))
}
