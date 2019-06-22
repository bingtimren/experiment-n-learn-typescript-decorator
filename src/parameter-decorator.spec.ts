// tslint:disable
import test from 'ava';
import {Greeter, ExtendedDecoratedGreeter} from './parameter-decorator'

test('Property decorator', t => {
    // test the decorator and the parameter interception works
    t.is(Greeter.staticSayHi("Roger", "pie day"), "Hi Roger!, happy pie day!")
    const g = new Greeter("Bob")
    t.is(g.instanceSayHi("Roger","pie day"), "Bob says: Hi Roger!, happy pie day!")
    // test the sub class inheritance works as expected
    t.is(ExtendedDecoratedGreeter.staticSayHi("Roger", "pie day"), "Hi Roger!, happy pie day!")
    const eg = new ExtendedDecoratedGreeter("Bob")
    t.is(eg.instanceSayHi("Roger","pie day"), "Bob says: Hi Roger!, happy pie day!")
    
})