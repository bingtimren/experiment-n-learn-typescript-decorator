// tslint:disable
import assert from 'assert'

/*******************************************************************************************************************
 * This section demonstrates:
 * 
 * - Instance method decorator is a function that receives:
 *      - target: the prototype object of the class (of which the instance method is a property)
 *      - propertyKey: string, name (string key) of the method
 *      - descriptor: the property descriptor, with 'value' being the method function
 * 
 * - Static method decorator is a function that receives:
 *      - target: the class (of which the static method is a property)
 *      - propertyKey: string, name (string key) of the method
 *      - descriptor: the property descriptor, with 'value' being the method function
 * 
 * - Getter / setter decorator is a function that receives:
 *      - target: the prototype object of the class (of which the getter/setter is a property)
 *      - propertyKey: string, name (string key) of the property
 *      - descriptor: the property descriptor, with 'get'/'set' being the getter/setter function
 * 
 * - Decorator's ability to modify the method by returning a new descriptor
 * 
 * - How to wrap around the original method to modify its behaviour
 * 
 *******************************************************************************************************************/

 /**
  * This is a decorator for an instance method (not a static method)
  * @param target - the class's prototype
  * @param propertyKey - name of the method, also the string key of the method as property of the prototype object
  * @param descriptor - the property descriptor
  */
function instanceMethodDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) : PropertyDescriptor{
    // asserts the received arguments are as described
    assert(target === Greeter.prototype)
    assert(propertyKey === 'greet')
    assert(target[propertyKey] === descriptor.value)

    // below demonstrates how to wrap around the original method to modify its behaviour
    const originalMethod = target[propertyKey] as Function
    // return a descriptor that replaces the 'value' with a new function that wraps around the old function
    return Object.assign({}, descriptor, {
        value: function(...args:any[]) {
            // as an instance method, expects 'this' to be an instance of the class
            assert(this instanceof Greeter)
            return originalMethod.apply(this, args)+"!!!"
        }
    }) 
}

/**
 * Static method decorator
 * @param target - the constructor function, i.e. the class
 * @param propertyKey - name of the method
 * @param descriptor - property descriptor
 */
function staticMethodDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) : PropertyDescriptor{
    // asserts the received arguments are as described
    assert(target === Greeter)
    assert(propertyKey === 'staticGreet')
    assert(target[propertyKey] === descriptor.value)

    // below demonstrates how to wrap around the original method to modify its behaviour
    const originalMethod = target[propertyKey] as Function
    // return a descriptor that replaces the 'value' with a new function that wraps around the old function
    return Object.assign({}, descriptor, {
        value: function(...args:any[]) {
            // as a static method, 'this' is the class
            assert(this as any === Greeter)
            return originalMethod.apply(this, args)+"..."
        }
    }) 
}

/**
 * Accessor decorator 
 * @param target - the class's prototype
 * @param propertyKey - the property key, i.e. the name of the property
 * @param descriptor - the property descriptor
 */
function accessorDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) : PropertyDescriptor{
    // asserts the received arguments are as described
    assert(target === Greeter.prototype)
    assert(propertyKey === 'message')
    const greeterMessagePropertyDescriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey) as PropertyDescriptor
    assert(greeterMessagePropertyDescriptor.get === descriptor.get && greeterMessagePropertyDescriptor.set === descriptor.set)

    // below demonstrates how to wrap around the original getter & setter to modify its behaviour
    const originalGetter = greeterMessagePropertyDescriptor.get as Function
    const originalSetter = greeterMessagePropertyDescriptor.set as Function
    // return a descriptor that replaces both the getter and setter with new functions that wrap around the old functions
    return Object.assign({}, descriptor, {
        get: function() {
            assert(this instanceof Greeter)
            return "{"+originalGetter.apply(this)+"}"
        },
        set: function(message:string) {
            assert(this instanceof Greeter)
            originalSetter.apply(this, ["*"+message+"*"])
        }
    }) 
}


/**
 * The class that has decorated static and instance methods
 */
export class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }

    @instanceMethodDecorator
    greet() {
        return "Hello, " + this.greeting;
    }
    @staticMethodDecorator
    static staticGreet() {
        return "Hi there"
    }
    @accessorDecorator
    get message():string {return this.greeting};
    // it would be wrong to also decorate the setter - only one of the getter / setter of same name can be decorated
    set message(message:string){ this.greeting = message}
}

