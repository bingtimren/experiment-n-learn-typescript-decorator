// tslint:disable
import test from 'ava';
import {Greeter,ExtendedDecoratedGreeter,Bar,Foo,ExtendedFooWhichIsReplacedByBar} from './class-decorator'
/**
 * This demonstrates that the classDecoratorThatExtends indeed extends the old Greeter class, so the 
 * variable 'Greeter' no longer refers to the old Greeter class but the extended class that is returned
 * from the decorator
 */
test('Class decorator that dynamically extends Greeter', t => {
    // this demos that Greeter after decoration is the extended class
    t.is(Greeter.name, 'ExtendedTarget');
    // so the instance g is instance of an extended class
    const g = new Greeter('Winston') as any;
    // examines the instance g has all the old and new properties and methods
    t.is(g instanceof Greeter, true);
    t.is(g.property, 'old property');
    t.is(g.newProperty, 'new property')
    t.is(g.hello, 'Winston');
    t.is(g.method(), 'old method:Winston');
    t.is(g.newMethod(), 'new method');
})

test('Subclass of a class that is extended by class decorator also inheritate the extended features', t=>{
    // test sub class of decorated Greeter
    const eg = new ExtendedDecoratedGreeter("Winston") as any
    t.is(eg instanceof Greeter, true);
    t.is(eg.property, 'old property');
    t.is(eg.newProperty, 'new property')
    t.is(eg.hello, 'Winston');
    t.is(eg.method(), 'old method:Winston');
    t.is(eg.newMethod(), 'new method');

});

/**
 * This demonstrates that the classDecoratorThatExtends indeed extends the old Greeter class, so the 
 * variable 'Greeter' no longer refers to the old Greeter class but the extended class that is returned
 * from the decorator
 */
test('Class decorator that replaces Bar with Foo', t => {
    // Bar is indeed replaced with Foo
    t.is(Foo === Bar, true);
});

// this demonstrates that the subclass of Foo is actually subclass of Bar

test('Subclass of Foo which is actually Bar', t=>{
    const ef = new ExtendedFooWhichIsReplacedByBar()
    t.is(ef instanceof Bar, true)
})