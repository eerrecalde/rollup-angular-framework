import * as Utils from './utils';

it('1- getObjectValueFromString should get object value', () => {
  const obj = {
    test: 1,
    test2: {
      value2: 2,
    },
  };
  const objectInString = 'test2.value2';
  const res = Utils.getObjectValueFromString(obj, objectInString);

  expect(res).toBe(2);
});

it('2- getObjectValueFromString should get undefined', () => {
  const obj = {
    test: 1,
    test2: {
      value2: 2,
    },
  };

  const objectInString = 'test2.value11';
  const res = Utils.getObjectValueFromString(obj, objectInString);

  expect(res).toBe(undefined);
});
