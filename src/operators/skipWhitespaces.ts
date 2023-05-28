import type { SimpleOperator } from '..'
import { skipWhile } from './skipWhile'

const SPACE_PATTERN = /\s/

/**
 * `skipWhile(c => /\s/.test(c))`
 * @since v1.0.0
 */
export function skipWhitespaces(limit?: number | null): SimpleOperator<'text', 'skipWhile'> {
    return skipWhile(char => SPACE_PATTERN.test(char), {limit})
}
