import { createHollowChunk } from '../../utils/index.js'
import { createBasicInterpreter } from './factories/index.js'

export const skip = createBasicInterpreter<'skip'>((buffer, count) => {
    const skipped = buffer.skip(count)

    return createHollowChunk(skipped)
})
