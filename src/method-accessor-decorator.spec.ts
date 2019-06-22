// tslint:disable
import test from 'ava';
import { Greeter } from './method-accessor-decorator';

// tests that the decorators actually works
test('Instance method decorator works', t => {
  const g = new Greeter('human');
  t.is(g.greet(), 'Hello, human!!!');
});

test('Static method decorator works', t => {
  t.is(Greeter.staticGreet(), 'Hi there...');
});

test('Getter & Setter decorator works', t => {
  const g = new Greeter('mate');
  t.is(g.message, '{mate}');
  g.message = 'boy';
  t.is(g.message, '{*boy*}');
});
