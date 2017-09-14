import angular from 'angular';
import '../_mocks/queryAPImocks';
import './filterIo.directive';
// import { FilterIoCore } from '../../dist/angular.fwk.umd';

const { module, inject } = angular.mock;

describe('Directive_Ctp_Filter_Io', () => {
	let compile;
	let rootScope;
	let scope;
	let itemsMock;
	let mockqueryAPIResponse;

	// List of modules to include
	const modules = ['mocks.queryAPI', 'directive.data'];
	modules.forEach((el) => {
		beforeEach(module(el));
	});

	const injectModules = function (_$compile_, _$rootScope_, _mockqueryAPIResponse_) {
		compile = _$compile_;
		rootScope = _$rootScope_;
		scope = rootScope.$new();
		mockqueryAPIResponse = _mockqueryAPIResponse_;
	};

	function getObjectFromArray(arr) {
		const obj = {};

		arr.forEach((el) => {
			obj[el.type] = el;
		});

		return obj;
	}

	const getCompiledElement = function (i, f, isPart) {
		scope.items = i;
		scope.fltrs = f;
		scope.isPartial = isPart;

		let element = `
			<ctp-filter-io items="items" filters="fltrs" is-partial="{{isPartial}}" scopeprefix="data">
				{{data}}
			</ctp-filter-io>
		`;
		element = compile(element)(scope);
		scope.$digest();
		return JSON.parse(element.text());
	};

	let items;
	let filters;
	let data;

	beforeEach(() => {
		inject(injectModules);
		items = '';
		filters = '';
		data = '';
		itemsMock = mockqueryAPIResponse[
			':37376/services/query/product:test:asynch/VALID_SESSION-ValidSessionValidProcessObjectQuery'
		].returnStatus.data.results;
	});

	it('No filters, Should return same items', () => {
		filters = [];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(items.length);
	});

	it('Empty filter, Should return same items', () => {
		filters = [{}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(items.length);
	});

	it('Filter by brand "5763956102519_8528", Should return 3 items', () => {
		filters = [{'type': 'productBrand', 'typeValue': '5763956102519_8528'}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(3);
	});

	it('Filter by names given 2 names: "Office Standard", and "Windows", Should return 2 items', () => {
		filters = [{'type': 'productName', 'typeValue': ['Office Standard', 'Windows']}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(2);
	});

	it('Specific filter, Should return only 1 item', () => {
		filters = [{'type': 'productName', 'typeValue': 'Office Standard', 'signature': 'NameObject_001'}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(1);
	});

	it('Specific filter, Should return only 1 item', () => {
		filters = [{'type': 'productName', 'typeValue': 'Office Standard', 'signature': 'NameObject_001'}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(1);
	});

	it('Specific filter, should match Snapshot', () => {
		filters = [{'type': 'productName', 'typeValue': 'Office Standard', 'signature': 'NameObject_001'}];
		items = itemsMock;
		data = getCompiledElement(items, filters);

		// taking less properties from the product list to facilitate the comparission.
		const data2 = data.map(el => {
			const tmpObj = getObjectFromArray(el.data.io);
			return {productName: tmpObj.productName.typeValue, productCategory: tmpObj.productCategory.typeValue};
		});

		expect(JSON.stringify(data2)).toMatchSnapshot();
	});

	it('Specific multiple filter, Should return 2 items', () => {
		filters = [
			{'type': 'MarketPlace', 'typeValue': 'Product'},
			{'type': 'productCategory', 'typeValue': '5764995907042_9b26'},
		];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(2);
	});

	it('Case ignore. When sending same value but different case, should also return the item', () => {
		filters = [{'type': 'productName', 'typeValue': 'OFFICE STANDARD'}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(1);
	});

	it('Partial text. "Office St" should also match, because is part of the whole name "Office Standard"', () => {
		filters = [{'type': 'productName', 'typeValue': 'Office St'}];
		items = itemsMock;
		const isPartial = true;
		data = getCompiledElement(items, filters, isPartial);
		expect(data.length).toBe(1);
	});

	it('Exact text. "Office St" should not match "Office Standard"', () => {
		filters = [{'type': 'productName', 'typeValue': 'Office St'}];
		items = itemsMock;
		const isPartial = false;
		data = getCompiledElement(items, filters, isPartial);
		expect(data.length).toBe(0);
	});

	it(`Partial text. "Office Standard2" should not match,
			because it isn't included in the name "Office Standard"`, () => {
		filters = [{'type': 'productName', 'typeValue': 'Office Standard2'}];
		items = itemsMock;
		const isPartial = true;
		data = getCompiledElement(items, filters, isPartial);
		expect(data.length).toBe(0);
	});

	it('Numerical filter. price', () => {
		filters = [{'type': 'productStock', 'typeValue': 36}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(1);
	});

	it('List of items null, Should return empty array', () => {
		filters = [{'type': 'productCategory'}];
		items = null;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(0);
	});

	// it('testing filter IO core', () => {
	// 	const res = FilterIoCore.getFiltredCollection(itemsMock, [
	// 		{'type': 'productName', 'typeValue': 'Office Standard', 'signature': 'NameObject_001'},
	// 	], false);
	// 	expect(res.length).toBe(1);
	// })
});
