import { getEmptyChunk } from '../../utils'
import { createBasicInterpreter } from './factories'

export const skip = createBasicInterpreter<'skip'>((buffer, count) => {
    buffer.skip(count)

    return getEmptyChunk(buffer.chunkTypeId)
})
