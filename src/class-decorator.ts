// tslint:disable
import assert from 'assert';

/**
 * This is a demo of class decorators in typescript (experimental).
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

function classDecoratorThatExtends<T extends new (...args: any[]) => {}>(
  target: T
) {
  // Here we examine the target, which should be the Greeter
  // So, a class decorator receives the decorated class, which in JS is just the constructor function, as the target
  assert(
    target.name === 'Greeter',
    'Target is the Greeter class, which has name Greeter'
  );
  assert(
    typeof target === 'function',
    'Target is the Greeter class, which is a function'
  );
  assert(
    target.prototype.constructor === target,
    "Target is the Greeter class, which has a 'prototype' property, with 'constructor' points back"
  );
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
export class Greeter {
  public property = 'old property';
  constructor(public hello: string) {}
  public method() {
    return 'old method:' + this.hello;
  }
}

/**
 * Here is a sub class of the decorated Greeter, it should inherit the extended property and methods
 * from the decoration.
 */
export class ExtendedDecoratedGreeter extends Greeter {}

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

export class Foo {
  public foo: boolean;
  public bar: string; // this is important, otherwise Typescript reports error
  constructor() {
    this.foo = true;
    this.bar = "I'm a Bar but actually a Foo";
  }
}

/**
 * This is a class decorator that replaces Bar with Foo. Although Foo does not need to extend Bar, it still needs to be compatible with Bar.
 * @param target - to receive Bar in the test
 */

function classDecoratorThatReplaces<T extends new (...args: any[]) => {}>(
  _target: T
) {
  return Foo;
}

/**
 * This is the decorated Bar class. After decoration, variable 'Bar' actually refers to the class 'Foo'
 */
@classDecoratorThatReplaces
export class Bar {
  public bar: string;
  // because the Bar class is actually replaced, this constructor is never executed
  /* istanbul ignore next */
  constructor() {
    this.bar = "I'm a bar";
  }
}

/**
 * A subclass of decorated Foo, is actually a subclass of Bar, as Foo is decorated and replaced by Bar
 */

export class SubclassOfBar extends Bar {}
