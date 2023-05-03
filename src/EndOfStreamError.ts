export const EndOfStreamError: EndOfStreamErrorConstructor = class EndOfStreamError extends Error {
    static readonly DEFAULT_MESSAGE = 'End of stream has been reached.'

    constructor(message?: string | null, options?: ErrorOptions | null) {
        super(message ?? EndOfStreamError.DEFAULT_MESSAGE, options ?? undefined)
        this.name = EndOfStreamError.name
    }
}
interface EndOfStreamErrorConstructor {
    readonly prototype: Error
    readonly DEFAULT_MESSAGE: string

    new(message?: string | null, options?: ErrorOptions | null): Error
}
