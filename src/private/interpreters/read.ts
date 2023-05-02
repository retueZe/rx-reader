import { createBasicInterpreter } from './factories'

export const read = createBasicInterpreter<'read'>((buffer, count) => buffer.read(count))
