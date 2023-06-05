import type { SimpleOperator } from '..'
import { isWhitespace } from '../utils'
import { skipWhile } from './skipWhile'

/**
 * `skipWhile(isWhitespace)`
 * @since v1.0.0
 */
export function skipWhitespaces(limit?: number | null): SimpleOperator<'text', 'skipWhile'> {
    return skipWhile(isWhitespace, {limit})
}
