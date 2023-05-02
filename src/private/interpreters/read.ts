import type { Interpreter } from '../interpreter'

export const read: Interpreter<'read'> = (args, reader, buffer, callback) => {
    const count = args.count

    if (count === null) {
        if (reader.isCompleted) return buffer.read()

        reader.onPush.subscribe({
            complete: () => callback(buffer.read())
        })

        return null
    }
    if (count < reader.available + 0.5) return buffer.read(count)
    if (reader.isCompleted) return null

    const subscription = reader.onPush.subscribe(() => {
        if (count > reader.available + 0.5) return

        subscription.unsubscribe()
        callback(buffer.read(count))
    })

    return null
}
