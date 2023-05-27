import type { Result } from 'async-option'
import type { AsyncResult } from 'async-option/async'
import type { Observable, Unsubscribable } from 'rxjs'

export type SimpleGenericOperatorArgsTypeMap = {
    read: Readonly<{count: number | null}>
    peek: Readonly<{count: number | null}>
    skip: Readonly<{count: number | null}>
}
export type SimpleTextOperatorArgsTypeMap = SimpleGenericOperatorArgsTypeMap & {
    readWhile: Readonly<{condition: (char: string) => boolean, limit: number | null, inclusive: boolean}>
}
export type SimpleBinaryOperatorArgsTypeMap = SimpleGenericOperatorArgsTypeMap & {
    readWhile: Readonly<{condition: (byte: number) => boolean, limit: number | null, inclusive: boolean}>
}

type ChunkTypeInfoMap = {
    'text': [string, string, SimpleTextOperatorArgsTypeMap],
    'binary': [Uint8Array, number, SimpleBinaryOperatorArgsTypeMap]
}
export type ChunkTypeId = keyof ChunkTypeInfoMap

export type ChunkTypeMap = {
    [C in ChunkTypeId]: ChunkTypeInfoMap[C][0]
}
export type ChunkItemTypeMap = {
    [C in ChunkTypeId]: ChunkTypeInfoMap[C][1]
}
export type SimpleOperatorArgsTypeMap = {
    [C in ChunkTypeId]: ChunkTypeInfoMap[C][2]
}

export type Chunk = ChunkTypeMap[ChunkTypeId]
export type ChunkItem = ChunkItemTypeMap[ChunkTypeId]
export type SimpleOperatorId = {
    [C in ChunkTypeId]: keyof SimpleOperatorArgsTypeMap[C]
}
export type GenericOperatorId = SimpleOperatorId[ChunkTypeId]
export type SimpleOperator<C extends ChunkTypeId = 'text', I extends SimpleOperatorId[C] = SimpleOperatorId[C]> = {
    id: I,
    args: SimpleOperatorArgsTypeMap[C][I]
}

export type ComplexOperator<O, E = unknown, C extends ChunkTypeId = 'text'> = () => SimpleOperatorIterator<O, E, C>
export type SimpleOperatorIterator<O, E = unknown, C extends ChunkTypeId = 'text'> =
    Generator<Readonly<SimpleOperator<C>>, Result<O, E>, ChunkTypeMap[C]>

export interface IReader<C extends ChunkTypeId = 'text'> extends Unsubscribable {
    readonly available: number
    readonly chunkTypeId: C
    readonly isCompleted: boolean
    readonly isBinary: boolean
    readonly onPush: Observable<void>

    read(operator: SimpleOperator<C>): Promise<ChunkTypeMap[C]>
    read<O, E>(operator: ComplexOperator<O, E, C>): AsyncResult<O, E>
}
