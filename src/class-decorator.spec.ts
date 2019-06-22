// tslint:disable
import test from 'ava';
import assert from 'assert'

/**
 * This test is a demo of class decorators in typescript (experimental).
 * 
 * See: https://www.typescriptlang.org/docs/handbook/decorators.html
 * 
 */

/*************************************************************************************************************************
 * This section demonstrates:
 * 
 * (1) Class decorator receives a class (in Javascript, the constructor function) as target.
 * (2) A class decorator's ability (and syntax) to dynamically extend the target class.
 **************************************************************************************************************************/

/**
 * This is the decorator. It's a function that receives a class target (a constructor function). It dynamically extends
 * the target.
 *  
 * @param target - the class to be extended
*/

function classDecoratorThatExtends<T extends new (...args: any[]) => {}>(target: T) {
    // Here we examine the target, which should be the Greeter
    // So, a class decorator receives the decorated class, which in JS is just the constructor function, as the target
    assert(target.name === 'Greeter')
    assert(target.toString().startsWith("class Greeter {"))
    // here we dynamically extends the target, add some new property and methods
    return class ExtendedTarget extends target {
        public newProperty = 'new property';
        public newMethod() {
            return 'new method';
        }
    };
}

/**
 * Here looks like the "old" Greeter class but with the decoration, it's in fact a syntax sugar of
 * decorating (calling decorator) the old Greeter class and resulting a new, extended class.
 */
@classDecoratorThatExtends
class Greeter {
    public property = 'old property';
    constructor(public hello: string) { }
    public method() {
        return 'old method:' + this.hello;
    }
}

class ExtendedDecoratedGreeter extends Greeter {
}

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

/*************************************************************************************************************************
 * This section demonstrates that class decorator can return a class that does not extend the target, but nevertheless
 * Typescript still checks the compatibility of the returned class with the target
 **************************************************************************************************************************/

/**
 * This is class "Foo" that will be returned by the class decorator classDecoratorThatReplaces to replace class "Bar"
 * Typescript would still check the signature of the return object of the class decorator for compatibility with the 
 * decorated class, Bar. 
 * 
 * Since Bar has a public property 'bar', here Foo must also has that property to be compatible with Bar, though Foo does not 
 * necessarily extends Bar.
 */

class Foo {
    public foo:boolean;
    public bar:boolean = true; // this is important, otherwise Typescript reports error
    constructor(){
        this.foo = true
    }
}

/**
 * This is a class decorator that replaces Bar with Foo. Although Foo does not need to extend Bar, it still needs to be compatible with Bar.
 * @param target - to receive Bar in the test
 */

function classDecoratorThatReplaces<T extends new (...args: any[]) => {}>(_target: T) {
    return Foo;
}

/**
 * This is the decorated Bar class. After decoration, variable 'Bar' actually refers to the class 'Foo'
 */
@classDecoratorThatReplaces
class Bar {
    public bar:boolean;
    constructor(){
        this.bar = true
    }
}

/**
 * This demonstrates that the classDecoratorThatExtends indeed extends the old Greeter class, so the 
 * variable 'Greeter' no longer refers to the old Greeter class but the extended class that is returned
 * from the decorator
 */
test('Class decorator that replaces Bar with Foo', t => {
    // Bar is indeed replaced with Foo
    t.is(Foo === Bar, true);
});

/**
 * A subclass of decorated Foo, is actually a subclass of Bar, as Foo is decorated and replaced by Bar
 */

class ExtendedFooWhichIsReplacedByBar extends Foo {

}

// this demonstrates that the subclass of Foo is actually subclass of Bar

test('Subclass of Foo which is actually Bar', t=>{
    const ef = new ExtendedFooWhichIsReplacedByBar()
    t.is(ef instanceof Bar, true)
})