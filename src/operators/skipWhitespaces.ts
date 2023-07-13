import type { SimpleOperatorIterator } from '../index.js'
import { isWhitespace } from '../utils/index.js'
import { skipWhile } from './skipWhile.js'

/**
 * `skipWhile(isWhitespace)`
 * @since v1.0.0
 */
export function skipWhitespaces(limit?: number | null): SimpleOperatorIterator<number> {
    return skipWhile(isWhitespace, {limit})
}
