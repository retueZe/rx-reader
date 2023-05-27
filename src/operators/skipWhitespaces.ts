import type { SimpleOperator } from '..'
import { skipWhile } from './skipWhile'

const SPACE_PATTERN = /\s/

export function skipWhitespaces(limit?: number | null): SimpleOperator<'text', 'skipWhile'> {
    return skipWhile(char => SPACE_PATTERN.test(char), {limit})
}
