/** @since v1.0.0 */
export const EndOfStreamError: EndOfStreamErrorConstructor = class EndOfStreamError extends Error {
    static readonly DEFAULT_MESSAGE = 'The end of stream has been reached.'

    constructor(message?: string | null, options?: ErrorOptions | null) {
        super(message ?? EndOfStreamError.DEFAULT_MESSAGE, options ?? undefined)
        this.name = EndOfStreamError.name
    }
}
interface EndOfStreamErrorConstructor {
    /** @since v1.0.0 */
    readonly prototype: Error
    /** @since v1.0.0 */
    readonly DEFAULT_MESSAGE: string

    /** @since v1.0.0 */
    new(message?: string | null, options?: ErrorOptions | null): Error
}
