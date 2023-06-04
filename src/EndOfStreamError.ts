/** @since v1.0.0 */
export class EndOfStreamError extends Error {
    static readonly DEFAULT_MESSAGE = 'The end of stream has been reached.'

    constructor(message?: string | null, options?: ErrorOptions | null) {
        super(message ?? EndOfStreamError.DEFAULT_MESSAGE, options ?? undefined)
        this.name = EndOfStreamError.name
    }
}
