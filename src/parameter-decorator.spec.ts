// tslint:disable
import test from 'ava';
import assert from 'assert'

/*************************************************************************************************************************
 * This section demonstrates:
 * 
 * (1) Parameter decorator of a static method of a class receives:
 *      - target: a class (in Javascript, the constructor function)
 *      - name: of the property
 *      - index: ordinal index of the parameter in the function's parameter list
 * (2) DO NOT attempt to replace the static method. This won't work (test in July 2019). Although it's possible to 
 *      reassign a decorated method to the target under name, after the decoration the original method is restored. 
 *      The reason seems to be that, in the compiled Javascript code, "Object.defineProperty" is used to set the original
 *      method back. 
 * (3) Here we demonstrate a solution to make parameter interception work: use together with a method decorator
 **************************************************************************************************************************/

/**
 * This is a decorator factory, returns a parameter decorator to intercept and test if a parameter of a static method passes the test
 * @param desc - description of the test
 * @param f - function that tests the parameter
 */

const parameterDecorationSymbol = Symbol()

function parameterConvert(f: ((p: any) => any)) {
    // a parameter decorator expects to receive a target, a name, and a ordinal index    
    return function (target: any, name: string, index: number) {
        // In both situation: decorating a static or instance method parameter, should be able
        // to find the method (function) to be decorated at the target (by the name)
        const originalMethod = target[name] as Function
        assert(typeof originalMethod === 'function')
        // not always true, but in this test the original method string includes the name
        assert(originalMethod.toString().includes(name))
        assert(originalMethod.length > index)
        // below demonstrates the target received by the decorator function
        // under each scenario: decorating a static method, or an instance method
        switch (name) {
            case "staticSayHi":
                // here the static method, the target would be the class (constructor function)
                assert(typeof target === 'function')
                // the target is class 'Greeter'
                assert(target.name === 'Greeter')
                assert(target.toString().startsWith("class Greeter {"))
                assert(typeof target.prototype === 'object')
                break
            case "instanceSayHi":
                // here the instance method, the target would be the prototype
                assert(typeof target.constructor === 'function')
                assert(target.constructor.name === 'Greeter')
                assert(target.constructor.toString().startsWith("class Greeter {"))
                assert(target.constructor.prototype === target)
                break
        }
        // here, as part of the demonstration solution, parameter decorator registers the parameter test with the original method
        const parameterTestRegister = Object.getOwnPropertyDescriptor(originalMethod, parameterDecorationSymbol)
        if (parameterTestRegister === undefined) {
            Object.defineProperty(originalMethod, parameterDecorationSymbol, {
                value: [[index, f],] // the tuple array
            })
        } else {
            parameterTestRegister.value.push([index, f])
        }
    }
}

/**
 * This demonstrates 
 * @param target - class or prototype object
 * @param name - name of the method
 */
function processParameters(_target:any, _name:string, desc:PropertyDescriptor):void|PropertyDescriptor{
    const originalMethod =  desc.value as Function
    const parameterTestRegisterDescriptor = Object.getOwnPropertyDescriptor(originalMethod, parameterDecorationSymbol
        );
    if (parameterTestRegisterDescriptor) {
        const parameterTestRegister = parameterTestRegisterDescriptor.value as [number,(p:any)=>any][]
        // replace the original method
        return Object.assign({}, desc, {
            value: function checkParameterWrapperFunction(...args:any[]){
                // inside the wrapper function, do the conversion
                debugger
                parameterTestRegister.forEach(([index, f])=>{
                    const originalParameterValue = args[index]
                    args[index] = f(originalParameterValue)
                })
                // call the original method
                return originalMethod.apply(this, args)
            }
        }) 
    }
}

const addExclamation = parameterConvert(p => p+"!")

class Greeter {
    @processParameters
    public static staticSayHi(@addExclamation who: any, @addExclamation day:string): string {
        return "Hi " + who+", happy "+day
    }
    @processParameters
    public instanceSayHi(@addExclamation who: any, @addExclamation day:string): string {
        return this.greeter+" says: Hi " + who+", happy "+day
    }
    constructor(public greeter:string){
    }
}

// test inheritence behavior
class ExtendedDecoratedGreeter extends Greeter{
}


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