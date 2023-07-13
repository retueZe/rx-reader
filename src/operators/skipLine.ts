import { SimpleOperatorIterator } from '../index.js'
import { skipWhile } from './skipWhile.js'

/** @since v1.0.0 */
export type SkipLineOptions = {
    /**
     * If `true`, retains line termination sequence.
     * @default false
     * @since v1.0.0
     */
    inclusive?: boolean | null
}

/**
 * Skips characters until the line ends. The condition of line breaking is CR, LF, or CRLF.
 * @since v1.0.0
 */
export function* skipLine(
    options?: Readonly<SkipLineOptions> | null
): SimpleOperatorIterator<number, never> {
    const inclusive = options?.inclusive ?? false
    const predicateContext = {previous: '', endingLength: 0}
    const predicate = unboundLineBreakPredicate.bind(predicateContext)
    const skipped = yield* skipWhile(predicate, {
        inclusive: false,
        strict: false
    })

    return inclusive
        ? skipped
        : skipped - predicateContext.endingLength
}

function unboundLineBreakPredicate(this: {previous: string, endingLength: number}, char: string): boolean {
    if (this.previous === '\n') return false
    if (char === '\n') {
        if (this.previous === '\r') this.endingLength = 1

        this.previous = '\n'
        this.endingLength++

        return true
    }
    if (this.previous === '\r') {
        this.endingLength = 1

        return false
    }

    this.previous = char

    return true
}
