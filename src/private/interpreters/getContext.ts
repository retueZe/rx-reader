import type { ChunkTypeId, ChunkTypeMap, IIoBuffer, IReader, SimpleOperatorArgsTypeMap } from '../../index.js'
import type { GenericInterpreter } from '../interpreter.js'
import { Result, Some, Success } from 'async-option'
import { getEmptyChunk } from '../../utils/index.js'
import type { ContextCollection } from '../ContextCollection.js'

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
