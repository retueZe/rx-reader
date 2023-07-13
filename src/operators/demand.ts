import { Failure } from 'async-option'
import { ChunkTypeId, ChunkTypeMap, SimpleOperatorIterator } from '../abstraction'
import { areChunksEqual } from '../utils/chunk'
import { peek } from './peek'
import { skip } from './skip'

/** @since v1.0.0 */
export type DemandOptions = {
    /**
     * If `true`, skips the demanded value on success.
     * @default true
     * @since v1.0.0
     */
    inclusive?: boolean | null
}

/**
 * Tries to peek `expected.length` chunk items, then compares them to `expected`. If they are not equal, calls `errorFactory` and returns the factory result wrapped into the `Failure` class. On success, returns the read chunk.
 * @since v1.0.0
 */
export function* demand<C extends ChunkTypeId = 'text', E = unknown>(
    expected: ChunkTypeMap[C],
    errorFactory: (actual: ChunkTypeMap[C]) => E,
    options?: Readonly<DemandOptions>
): SimpleOperatorIterator<ChunkTypeMap[C], E, C> {
    const inclusive = options?.inclusive ?? true
    const actual = yield peek(expected.length, {strict: false})

    if (!areChunksEqual(expected, actual)) throw new Failure(errorFactory(actual))
    if (inclusive) yield* skip(actual.length)

    return actual
}
