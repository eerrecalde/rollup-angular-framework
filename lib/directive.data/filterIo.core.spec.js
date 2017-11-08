import FilterIoCore from './filterIo.core';
import mock from './mock';

// console.log(FilterIoCore)

it('1- Should get 1 result matching the name Office Standard', () => {
	const res = FilterIoCore.getFiltredCollection(mock, [
		{'type': 'productName', 'typeValue': 'Office Standard', 'signature': 'NameObject_001'},
	], false);

	expect(res.length).toBe(1);
})

it('2- Should get 0 result matching the name Office Standard2', () => {
	const res = FilterIoCore.getFiltredCollection(mock, [
		{'type': 'productName', 'typeValue': 'Office Standard2', 'signature': 'NameObject_001'},
	], false);

	expect(res.length).toBe(0);
})
