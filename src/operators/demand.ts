import { Failure, Success } from 'async-option'
import { ChunkTypeId, ChunkTypeMap, SimpleOperatorIterator } from '../abstraction'
import { areChunksEqual } from '../utils/chunk'
import { peek } from './peek'
import { skip } from './skip'

export type DemandOptions = {
    inclusive?: boolean | null
}

export function* demand<C extends ChunkTypeId = 'text', E = unknown>(
    expected: ChunkTypeMap[C],
    errorFactory: (actual: ChunkTypeMap[C]) => E,
    options?: Readonly<DemandOptions>
): SimpleOperatorIterator<ChunkTypeMap[C], E, C> {
    const inclusive = options?.inclusive ?? true
    const actual = yield peek(expected.length, {strict: false})

    if (!areChunksEqual(expected, actual)) return new Failure(errorFactory(actual))
    if (inclusive) yield skip(actual.length)

    return new Success(actual)
}
