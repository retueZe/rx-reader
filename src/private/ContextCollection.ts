import { NONE, Option, Some } from 'async-option'
import * as OptionUtils from 'async-option/utils/option'
import { ContextConstructor } from '../abstraction'

export class ContextCollection {
    private readonly _mutableContexts = new Map<object, any>()
    private readonly _immutableContextStacks = new Map<object, any[]>()

    push(context: any): this {
        const constructor = context.constructor

        if (this._mutableContexts.has(constructor)) throw new Error('Mutable context cannot be pushed.')

        let stack = this._immutableContextStacks.get(constructor)

        if (typeof stack === 'undefined') {
            stack = []
            this._immutableContextStacks.set(constructor, stack)
        }

        stack.push(context)

        return this
    }
    pop<C>(constructor: ContextConstructor<C>): C {
        if (this._mutableContexts.has(constructor)) throw new Error('Mutable context cannot be popped.')

        const stack = this._immutableContextStacks.get(constructor)

        if (typeof stack === 'undefined') throw new Error('Context stack is empty.')

        const context = stack.pop()

        if (stack.length < 0.5) this._immutableContextStacks.delete(constructor)
        if (typeof context === 'undefined') throw new Error('STUB')

        return context
    }
    peek<C>(constructor: ContextConstructor<C>): Option<C> {
        if (this._mutableContexts.has(constructor)) throw new Error('Mutable context cannot be peeked.')

        const stack = this._immutableContextStacks.get(constructor)

        if (typeof stack === 'undefined') return NONE
        if (stack.length < 0.5) throw new Error('STUB')

        return new Some(stack[stack.length - 1])
    }
    set(context: any): this {
        const constructor = context.constructor

        if (this._immutableContextStacks.has(constructor)) throw new Error('Immutable context cannot be set.')
        if (this._mutableContexts.has(constructor)) throw new Error('Context of this type is already set.')

        this._mutableContexts.set(constructor, context)

        return this
    }
    unset(constructor: ContextConstructor): this {
        if (this._immutableContextStacks.has(constructor)) throw new Error('Immutable context cannot be unset.')
        if (!this._mutableContexts.has(constructor)) throw new Error('Context of this type is not found.')

        this._mutableContexts.delete(constructor)

        return this
    }
    get<C>(constructor: ContextConstructor<C>): Option<C> {
        if (this._immutableContextStacks.has(constructor)) throw new Error('Immutable context cannot be gotten.')

        const context = this._mutableContexts.get(constructor)

        return OptionUtils.from(context)
    }
}
