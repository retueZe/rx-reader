import { createBasicInterpreter } from './factories'

export const peek = createBasicInterpreter<'peek'>((buffer, count) => buffer.peek(count))
