import type { Option, Result } from 'async-option'
import type { AsyncResult } from 'async-option/async'
import type { Observable, Unsubscribable } from 'rxjs'

/** @since v1.0.0 */
export type SimpleGenericOperatorArgsTypeMap = {
    /** @since v1.0.0 */
    read: Readonly<{count: number | null, strict: boolean}>
    /** @since v1.0.0 */
    peek: Readonly<{count: number | null, strict: boolean}>
    /** @since v1.0.0 */
    skip: Readonly<{count: number | null, strict: boolean}>
    /** @since v1.0.0 */
    wait: Readonly<{promise: Promise<any>}>
    /** @since v1.0.0 */
    pushContext: Readonly<{context: any}>
    /** @since v1.0.0 */
    setContext: Readonly<{context: any}>
    /** @since v1.0.0 */
    unsetContext: Readonly<{constructor: ContextConstructor}>
    /** @since v1.0.0 */
    getContext: Readonly<{constructor: ContextConstructor, mutable: boolean, retain: boolean, target: {context: Option<any>}}>
}
/** @since v1.0.0 */
export type SimpleTextOperatorArgsTypeMap = SimpleGenericOperatorArgsTypeMap & {
    /** @since v1.0.0 */
    readWhile: Readonly<{condition: (char: string) => boolean, limit: number | null, inclusive: boolean}>
    /** @since v1.0.0 */
    peekWhile: Readonly<{condition: (char: string) => boolean, limit: number | null, inclusive: boolean}>
    /** @since v1.0.0 */
    skipWhile: Readonly<{condition: (char: string) => boolean, limit: number | null, inclusive: boolean}>
}
/** @since v1.0.0 */
export type SimpleBinaryOperatorArgsTypeMap = SimpleGenericOperatorArgsTypeMap & {
    /** @since v1.0.0 */
    readWhile: Readonly<{condition: (byte: number) => boolean, limit: number | null, inclusive: boolean}>
    /** @since v1.0.0 */
    peekWhile: Readonly<{condition: (byte: number) => boolean, limit: number | null, inclusive: boolean}>
    /** @since v1.0.0 */
    skipWhile: Readonly<{condition: (byte: number) => boolean, limit: number | null, inclusive: boolean}>
}

type ChunkTypeInfoMap = {
    'text': [string, string, SimpleTextOperatorArgsTypeMap],
    'binary': [Uint8Array, number, SimpleBinaryOperatorArgsTypeMap]
}
/** @since v1.0.0 */
export type ChunkTypeId = keyof ChunkTypeInfoMap

/** @since v1.0.0 */
export type ChunkTypeMap = {
    [C in ChunkTypeId]: ChunkTypeInfoMap[C][0]
}
/** @since v1.0.0 */
export type ChunkItemTypeMap = {
    [C in ChunkTypeId]: ChunkTypeInfoMap[C][1]
}
/** @since v1.0.0 */
export type SimpleOperatorArgsTypeMap = {
    [C in ChunkTypeId]: ChunkTypeInfoMap[C][2]
}

/** @since v1.0.0 */
export type Chunk = ChunkTypeMap[ChunkTypeId]
/** @since v1.0.0 */
export type ChunkItem = ChunkItemTypeMap[ChunkTypeId]
/** @since v1.0.0 */
export type SimpleOperatorId = {
    [C in ChunkTypeId]: keyof SimpleOperatorArgsTypeMap[C]
}
/** @since v1.0.0 */
export type GenericOperatorId = SimpleOperatorId[ChunkTypeId]
/** @since v1.0.0 */
export type SimpleOperator<C extends ChunkTypeId = 'text', I extends SimpleOperatorId[C] = SimpleOperatorId[C]> = {
    /** @since v1.0.0 */
    id: I,
    /** @since v1.0.0 */
    args: SimpleOperatorArgsTypeMap[C][I]
}

/** @since v1.0.0 */
export type ComplexOperator<O, E = unknown, C extends ChunkTypeId = 'text'> = () => SimpleOperatorIterator<O, E, C>
/** @since v1.0.0 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type SimpleOperatorIterator<O, E = unknown, C extends ChunkTypeId = 'text'> =
    Generator<Readonly<SimpleOperator<C>>, O, ChunkTypeMap[C]>

/** @since v1.0.0 */
export interface IReader<C extends ChunkTypeId = 'text'> extends Unsubscribable {
    /** @since v1.0.0 */
    readonly chunkTypeId: C
    /**
     * Reader completes once the owner buffer calls its `complete` method or the `unsubscribe` method is called.
     * @since v1.0.0
     */
    readonly isCompleted: boolean
    /** @since v1.0.0 */
    readonly isBinary: boolean
    /**
     * Consumes chunks from the owner buffer, returns not the same object as the owner's `onPush` property.
     * @since v1.0.0
     */
    readonly onPush: Observable<void>

    /** @since v1.0.0 */
    read(operator: SimpleOperator<C>): Promise<ChunkTypeMap[C]>
    /** @since v1.0.0 */
    read<O, E>(operator: ComplexOperator<O, E, C>, contexts?: Iterable<any> | null): AsyncResult<O, E>
}

export interface ContextConstructor<C = any> {
    readonly prototype: C
}
