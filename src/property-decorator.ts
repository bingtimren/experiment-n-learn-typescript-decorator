// tslint:disable
import assert from 'assert';

/*************************************************************************************************************************
 * This section demonstrates:
 *
 * (1) Static property decorator receives:
 *      - target: a class (in Javascript, the constructor function)
 *      - name: of the property
 * (2) Static property decorator's ability to get the property descriptor of the static property, only when the static property's
 *     value is defined in the original class
 * (3) Static property decorator's ability to assign the property a value
 * (4) Static property decorator is called at the time of definition of the decorated class, before class decorator
 **************************************************************************************************************************/

function staticPropertyDecorator(target: any, name: string) {
  // Demonstrate that the static property decorator receives the class as target
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
  // Also that the decorator is called at the time of definition of the decorated class, and before the class decorator
  callSequence++;
  assert(callSequence > 1 && callSequence < 6);

  // Demonstrate the static property decorator's ability to get the property descriptor (only when the staic property's
  // value is defined in the original class)
  const pd = Reflect.getOwnPropertyDescriptor(target, name);
  switch (name) {
    case 'greeting':
      assert((pd as PropertyDescriptor).value === 'class initialized');
      break;
    case 'undefinedStaticProperty':
      assert(pd === undefined);
      break;
  }
  // Demonstrate the static property decorator's ability to alter the value of the static
  target[name] = 'decorator initialized';
}

/*************************************************************************************************************************
 * This section demonstrates:
 *
 * (1) Instance property decorator receives:
 *      - target: prototype object of a class (the constructor function's .prototype object)
 *      - name: of the property
 * (2) A solution to work with a class decorator to inject value to the instance property
 * (3) Instance property decorator is called at class definition of decorated class, before the class decorator
 **************************************************************************************************************************/

const instancePropertyListForInjectionSymbol = Symbol();

function instancePropertyDecorator(target: any, name: string) {
  // Demonstrate that the instance property decorator receives the prototype as target
  assert(target === Greeter.prototype);
  assert(target.constructor === Greeter);
  // and receive the name of the property
  assert(name === 'greeter' || name === 'anotherProperty');
  // called at class definition
  callSequence++;
  // before the class decorator get called
  assert(callSequence < 6);

  // With property decorator only, nothing can be done to the instance property, because the decorator is called
  // at class definition time and cannot alter the constructor.
  // However with a class decorator, here we demonstrate a solution to let the instance property decorator mark the
  // decorated properties, and let the class decorator alter the instance property
  // We use a Symbol to register the names of the decorated properties
  const decoratedPropertyNames = target.constructor[
    instancePropertyListForInjectionSymbol
  ] as undefined | string[];
  if (decoratedPropertyNames === undefined) {
    target.constructor[instancePropertyListForInjectionSymbol] = [name];
  } else {
    decoratedPropertyNames.push(name);
  }
}

/**
 * As part of the demonstrated solution, the instance property decorator marks the names of the properties, and
 * the class decorator extends the constructor function and injects the values at construction of instances
 * @param target - as a class decorator, target is the class (the constructor function)
 */
function instancePropertyInjectionDecorator<
  T extends new (...args: any[]) => object
>(target: T) {
  // Demonstrates that class decorator get called the last after property decorators
  callSequence++;
  assert(callSequence === 6);
  // as class decorator, target is the constructor function
  return class ExtendedTarget extends target {
    constructor(...args: any[]) {
      super(...args); // calls the original constructor
      // the extended constructor is called after class definition
      callSequence++;
      assert(callSequence >= 8);
      // do the injection
      const propertyList = (target as any)[
        instancePropertyListForInjectionSymbol
      ] as undefined | string[];
      if (propertyList) {
        propertyList.forEach(pname => {
          (this as any)[pname] = 'injected value';
        });
      }
    }
  };
}

// mark the class definition
let callSequence = 1;

@instancePropertyInjectionDecorator
export class Greeter {
  @staticPropertyDecorator
  static greeting: string = 'class initialized';
  @staticPropertyDecorator
  static undefinedStaticProperty: string;
  @instancePropertyDecorator
  public greeter: string;
  @instancePropertyDecorator
  public anotherProperty: string;
  constructor(greeter: string) {
    this.greeter = greeter;
    this.anotherProperty = 'whatever';
  }
}

// after class definition
callSequence++;
assert(callSequence === 7);

// test inheritence behavior
export class ExtendedDecoratedGreeter extends Greeter {}
