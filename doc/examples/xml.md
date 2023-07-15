# XML parser

```javascript
function* xml() {
    yield* skipWhitespaces()
    yield* demand('<', () => 'unexpected-token')
    const tagName = yield readWhile(c => c !== ' ' && c !== '>' && c !== '/')
    let isClosed = false
    const attributes = {}

    while (true) {
        yield* skipWhitespaces()
        const next = yield peek(1)

        if (next === '/' || next === '>') {
            yield* skip(1)

            if (next === '/') {
                yield* demand('>', () => 'unexpected-token')
                isClosed = true
            }

            break
        }

        const attributeName = yield readWhile(c => c !== '=')
        yield* demand('="', () => 'unexpected-token')
        const attributeValue = yield readWhile(c => c !== '"')
        yield* skip(1)

        attributes[attributeName] = attributeValue
    }

    const children = []

    if (isClosed) return {name: tagName, attributes, children}

    while (true) {
        yield* skipWhitespaces()
        const next = yield peek(2)

        if (next === '</') break

        const child = yield* xml()
        children.push(child)
    }

    yield* skip(2)
    const closeTagName = yield readWhile(c => c !== '>')

    if (closeTagName !== tagName) throw new Failure('bad-close-tag-name')

    yield* skip(1)

    return {
        name: tagName,
        attributes,
        children
    }
}
```

There are, obviously, some holes here, but this is only an example.

<p align="center">
    ← Previous
    |
    <a href="https://github.com/retueZe/rx-reader/tree/master/doc/README.md">Index</a>
    |
    Next →
</p>
