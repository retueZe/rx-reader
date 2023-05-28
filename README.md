# `rx-reader`

This package provides an API that improves I/O performance.

*This package will show its advantages as far as receiving chunks of data gets larger and the amount of reading operation increases.*

## Why `rx-reader`?

There are already several (asynchronous) APIs designed to solve the same problem:

1. Load the whole data, then process it
2. Standard NodeJS streams/Streams API (callback/`Promise`-based API)
3. This package (generator-based API)

First option is good when the size of the data is not big enough (for example, just reading a small file). Due to working with memory buffer this option is the fastest in sense of data processing, but it loses its efficiency as the data size increases, because waiting for data fetching is not efficient: we can process already fetched data.

Due to some disadvantages of the first option the common tool to solve the problem is streaming. It allows us to not just wait for the data, but use that time wisely. But there's a problem: everytime we read a bit of information we have to check if we reached the end of the stream, and if yes, we have to wait for another chunk. Here some problems came up. For exmaple, where to store the state of the processor? Or, `if`'s following every `read` call is what we wanted?

Generator-based I/O solves this problem. Iteration can be performed in both synchronous and asynchronous way, so, there's no need to work with the data in terms of "chunks". We can just define some operators that we're going to put in `yield`, and receive from that `yield` the data we wanted. If there's enough data — good, just read it from the buffer and go on. If there's not — not a problem, pass the continuation to the callback and wait for new pieces of data.

Since our I/O is based on interrupting (pushing), the best solution was to use the [RxJS](https://npmjs.com/rxjs) package as the base. Also, this package was designed to have some kind of "bad input" cases handler — `maybe`/`either` monads. In addition, this package supports both text and binary chunk types.

## Getting started

```javascript
import { IoBuffer } from 'rx-reader'
import { demand, peek, readWhile, skipWhitespaces } from 'rx-reader/operators'
import { Failure, Success } from 'async-option'
import { of } from 'rxjs'

const NAME_PATTERN = /[a-z-]+/i

// funciton parsing HTTP message header lines
// returns `either`-like value
function* lineParser() {
    let result

    // simple operators returns read data, `skipXxx` methods returns empty chunks
    yield skipWhitespaces()
    // reads data while condition is true
    // has some options like `limit` and `inclusive` (limitless and non-inclusive by default)
    const name = yield readWhile(c => c !== ' ' && c !== ':')

    if (!NAME_PATTERN.test(name)) return new Failure('bad-name-format')

    yield skipWhitespaces()
    // calling built-in complex operator
    // reads desired amout of data, also demands it to be the passed value
    result = yield* demand(':', () => 'semicolon-expected')

    if (!result.isSucceeded) return result

    yield skipWhitespaces()
    const value = yield readWhile(c => c !== '\r')
    result = yield* demand('\r\n', () => 'new-line-expected')

    if (!result.isSucceeded) return result

    return new Success({name, value})
}

// you may enter tour input here to see the reaction
const INPUT = '  First  :  some value  \r\n  Second  :another value\r\n'

const buffer = new IoBuffer('text')
const reader = buffer.createReader()
reader.read(lineParser)
    .onSuccess(({name, value}) => console.log(`${name}:${value}`))
    .onFailure(error => console.log(`Error has been occurred: ${error}`))
// consumes stuff from observable, doesnt react on its completing
buffer.consume(of(INPUT))
// passing `undefined` or `null` to `peek` will cause it to read all the data until the buffer is marked as completed
reader.read(peek()).then(console.log)
buffer.complete()

// Output:
// First:some value
//   Second  :another value
// *blank line*
```

In this code are shown following advantages of this package:

1. Asynchronous (buffer consumes and completes data after the read routine being called);
2. Extensible (operators can be used inside other operators; you may create your own operators);
3. Flexibility (operators may consume some extra options desiged for some specific cases);
4. Fast (even if `from` instead of `of` was used here (a character array instead of the whole string), this method will work as fast as is).
5. Simple (subjectively; easy to read, easy to debug, easy to understand what is happening)
