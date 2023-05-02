import type { Result } from 'async-option'

export type ChunkTypeMap = {
    'text': string
    'binary': Uint8Array
}
export type ChunkTypeId = keyof ChunkTypeMap
export type Chunk = ChunkTypeMap[ChunkTypeId]

export type SimpleOperator<I extends SimpleOperatorId = SimpleOperatorId> = {
    id: I,
    args: SimpleOperatorArgsTypeMap[I]
}
export type SimpleOperatorArgsTypeMap = {
    read: Readonly<{count: number | null}>
    peek: Readonly<{count: number | null}>
    skip: Readonly<{count: number | null}>
}
export type SimpleOperatorId = keyof SimpleOperatorArgsTypeMap
export type SimpleOperatorArgs = SimpleOperatorArgsTypeMap[SimpleOperatorId]

export type ComplexOperator<O, E = unknown, C extends ChunkTypeId = 'text'> = () => SimpleOperatorIterator<O, E, C>
export type SimpleOperatorIterator<O, E = unknown, C extends ChunkTypeId = 'text'> =
    Generator<Readonly<SimpleOperator>, Result<O, E>, ChunkTypeMap[C]>

