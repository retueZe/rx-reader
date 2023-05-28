import { Failure, Success } from 'async-option'
import { ChunkTypeId, ChunkTypeMap, SimpleOperatorIterator } from '../abstraction'
import { areChunksEqual } from '../utils/chunk'
import { read } from './read'

export function* demand<C extends ChunkTypeId = 'text', E = unknown>(
    expected: ChunkTypeMap[C],
    errorFactory: (actual: ChunkTypeMap[C]) => E
): SimpleOperatorIterator<ChunkTypeMap[C], E, C> {
    const actual = yield read(expected.length, {strict: false})

    if (!areChunksEqual(expected, actual)) return new Failure(errorFactory(actual))

    return new Success(actual)
}
