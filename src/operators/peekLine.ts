import { ChunkTypeMap, SimpleOperatorIterator } from '../index.js'
import { peekWhile } from './peekWhile.js'

/** @since v1.0.0 */
export type PeekLineOptions = {
    /**
     * If `true`, retains line termination sequence.
     * @default false
     * @since v1.0.0
     */
    inclusive?: boolean | null
}

/**
 * Peeks characters until the line ends. The condition of line breaking is CR, LF, or CRLF.
 * @since v1.0.0
 */
export function* peekLine(
    options?: Readonly<PeekLineOptions> | null
): SimpleOperatorIterator<ChunkTypeMap['text'], never> {
    const inclusive = options?.inclusive ?? false
    const predicate = createLineBreakPredicate()
    const line = yield peekWhile(predicate, {
        inclusive: false,
        strict: false
    })

    return inclusive
        ? line
        : line.endsWith('\r\n')
            ? line.slice(0, line.length - 2)
            : line.endsWith('\r') || line.endsWith('\n')
                ? line.slice(0, line.length - 1)
                : line
}

function createLineBreakPredicate(): (this: {previous: string}, char: string) => boolean {
    const unboundPredicate = function(this: {previous: string}, char: string): boolean {
        if (this.previous === '\n') return false
        if (char === '\n') {
            this.previous = '\n'

            return true
        }
        if (this.previous === '\r') return false

        this.previous = char

        return true
    }

    return unboundPredicate.bind({previous: ''})
}
