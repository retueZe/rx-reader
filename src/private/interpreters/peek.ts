import { createBasicInterpreter } from './factories/index.js'

export const peek = createBasicInterpreter<'peek'>((buffer, count) => buffer.peek(count))
