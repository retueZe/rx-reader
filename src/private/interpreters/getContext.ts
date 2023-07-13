import type { ChunkTypeId, ChunkTypeMap, IReader, SimpleOperatorArgsTypeMap } from '../../abstraction'
import type { IIoBuffer } from '../../IoBuffer'
import type { GenericInterpreter } from '../interpreter'
import { Result, Some, Success } from 'async-option'
import { getEmptyChunk } from '../../utils'
import { ContextCollection } from '../ContextCollection'

export const getContext: GenericInterpreter<'getContext'> = <C extends ChunkTypeId = 'text'>(
    args: SimpleOperatorArgsTypeMap[C]['getContext'],
    reader: IReader<C>,
    buffer: IIoBuffer<C>,
    contexts: ContextCollection
): Result<ChunkTypeMap[C], Error> | null => {
    args.target.context = args.mutable
        ? contexts.get(args.constructor)
        : args.retain
            ? contexts.peek(args.constructor)
            : new Some(contexts.pop(args.constructor))

    return new Success(getEmptyChunk(buffer.chunkTypeId))
}
