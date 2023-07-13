import { createBasicInterpreter } from './factories/index.js'

export const read = createBasicInterpreter<'read'>((buffer, count) => buffer.read(count))
