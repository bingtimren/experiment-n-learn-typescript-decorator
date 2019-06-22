// tslint:disable
import test from 'ava';
import { Greeter, ExtendedDecoratedGreeter } from './property-decorator';

test('Static property decorator', t => {
  // test that static decorator is able to set value of static property
  t.is(Greeter.greeting, 'decorator initialized');
  t.is(Greeter.undefinedStaticProperty, 'decorator initialized');
  // test that inheritence behavior of static property is correct
  t.is(ExtendedDecoratedGreeter.greeting, 'decorator initialized');
  t.is(
    ExtendedDecoratedGreeter.undefinedStaticProperty,
    'decorator initialized'
  );
  // test instance property decorator and that the demonstrated solution actually works
  const g = new Greeter('Hi');
  t.is(g.greeter, 'injected value');
  t.is(g.anotherProperty, 'injected value');

  // test that the instance property decorator and the demonstrated injection solution
  // also works on sub classes
  const eg = new ExtendedDecoratedGreeter('Hello');
  t.is(eg.greeter, 'injected value');
  t.is(eg.anotherProperty, 'injected value');
});
