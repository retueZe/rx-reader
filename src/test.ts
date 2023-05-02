import { EMPTY } from 'async-option/utils/result'
import { Subject } from 'rxjs'
import { Reader, SimpleOperatorIterator } from '.'
import { read, peek, skip } from './operators'

const source = new Subject<string>()
const reader = new Reader('text', source)
reader.read(function*(): SimpleOperatorIterator<unknown, never> {
    console.log(yield peek(3))
    console.log(yield skip(4))
    console.log(yield read())

    return EMPTY
})
source.next('12')
source.next('3')
source.next('456789')
source.next('0')
source.complete()
