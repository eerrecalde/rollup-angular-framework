import {FilterIoCore, TestingStuff} from './filterIo.core';

console.log(FilterIoCore, TestingStuff)

it('testing filter IO core', () => {
	const res = FilterIoCore.getFiltredCollection([], [
		{'type': 'productName', 'typeValue': 'Office Standard', 'signature': 'NameObject_001'},
	], false);
	expect(res.length).toBe(0);
})
