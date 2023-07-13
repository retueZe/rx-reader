import { createHollowChunk } from '../../utils/chunk'
import { createBasicInterpreter } from './factories'

export const skip = createBasicInterpreter<'skip'>((buffer, count) => {
    const skipped = buffer.skip(count)

    return createHollowChunk(skipped)
})
