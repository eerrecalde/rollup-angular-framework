import '../_mocks/queryAPImocks.js';
import './filterIo.directive.js';
import { FilterIoCore } from '../../dist/angular.fwk.umd.js';

const { module } = angular.mock;

describe('Directive_Ctp_Filter_Io', () => {
	var compile, rootScope, scope, itemsMock, mockqueryAPIResponse;

	// List of modules to include
	var modules = ['mocks.queryAPI', 'directive.data'];
	modules.forEach((el) => {
		beforeEach(module(el));
	});

	var injectModules = function (_$compile_, _$rootScope_, _mockqueryAPIResponse_) {
		compile = _$compile_;
		rootScope = _$rootScope_;
		scope = rootScope.$new();
		mockqueryAPIResponse = _mockqueryAPIResponse_;
	};

	function getObjectFromArray(arr) {
		var obj = {};

		arr.forEach(function(el) {
			obj[el.type] = el;
		});

		return obj;
	}

	var getCompiledElement = function (i, f, isPart) {
		scope.items = i;
		scope.fltrs = f;
		scope.isPartial = isPart;

		var element = '<ctp-filter-io items="items" filters="fltrs" is-partial="{{isPartial}}" scopeprefix="data">{{data}}</ctp-filter-io>';
		element = compile(element)(scope);
		scope.$digest();
		return JSON.parse(element.text());
	};

	var getPoid = function(shard) {
		var orgPoId = 'Org_PoId';
		var userPoId = 'User_PoId';
		if (shard === 'org') {
			return orgPoId;
		} else if (shard === 'user') {
			return userPoId;
		}
	};

	var items, filters, data;

	beforeEach(function () {
		inject(injectModules);
		items = '';
		filters = '';
		data = '';
		itemsMock = mockqueryAPIResponse[':37376/services/query/product:test:asynch/VALID_SESSION-ValidSessionValidProcessObjectQuery'].returnStatus.data.results;
	});

	it('No filters, Should return same items', () => {
		filters = [];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(items.length);
	});

	it('Empty filter, Should return same items', function () {
		filters = [{}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(items.length);
	});

	it('Filter by brand "5763956102519_8528", Should return 3 items', function () {
		filters = [{'type': 'productBrand', 'typeValue': '5763956102519_8528'}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(3);
	});

	it('Filter by names given 2 names: "Office Standard", and "Windows", Should return 2 items', function () {
		filters = [{'type': 'productName', 'typeValue': ['Office Standard', 'Windows']}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(2);
	});

	it('Specific filter, Should return only 1 item', function () {
		filters = [{'type': 'productName', 'typeValue': 'Office Standard', 'signature': 'NameObject_001'}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(1);
	});

	it('Specific filter, Should return only 1 item', function () {
		filters = [{'type': 'productName', 'typeValue': 'Office Standard', 'signature': 'NameObject_001'}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(1);
	});

	it('Specific filter, should match Snapshot', function () {
		filters = [{'type': 'productName', 'typeValue': 'Office Standard', 'signature': 'NameObject_001'}];
		items = itemsMock;
		data = getCompiledElement(items, filters);

		// taking less properties from the product list to facilitate the comparission.
		var data2 = data.map(el => {
			var tmpObj = getObjectFromArray(el.data.io);
			return {productName: tmpObj.productName.typeValue, productCategory: tmpObj.productCategory.typeValue};
		});

		expect(JSON.stringify(data2)).toMatchSnapshot();
	});

	it('Specific multiple filter, Should return 2 items', function () {
		filters = [{'type': 'MarketPlace', 'typeValue': 'Product'}, {'type': 'productCategory', 'typeValue': '5764995907042_9b26'}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(2);
	});

	it('Case ignore. When sending same value but different case, should also return the item', function () {
		filters = [{'type': 'productName', 'typeValue': 'OFFICE STANDARD'}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(1);
	});

	it('Partial text. "Office St" should also match, because is part of the whole name "Office Standard"', function () {
		filters = [{'type': 'productName', 'typeValue': 'Office St'}];
		items = itemsMock;
		var isPartial = true;
		data = getCompiledElement(items, filters, isPartial);
		expect(data.length).toBe(1);
	});

	it('Exact text. "Office St" should not match "Office Standard"', function () {
		filters = [{'type': 'productName', 'typeValue': 'Office St'}];
		items = itemsMock;
		var isPartial = false;
		data = getCompiledElement(items, filters, isPartial);
		expect(data.length).toBe(0);
	});

	it('Partial text. "Office Standard2" should not match, because it isn\' included in the name "Office Standard"', function () {
		filters = [{'type': 'productName', 'typeValue': 'Office Standard2'}];
		items = itemsMock;
		var isPartial = true;
		data = getCompiledElement(items, filters, isPartial);
		expect(data.length).toBe(0);
	});

	it('Numerical filter. price', function () {
		filters = [{'type': 'productStock', 'typeValue': 36}];
		items = itemsMock;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(1);
	});

	it('List of items null, Should return empty array', function () {
		filters = [{'type': 'productCategory'}];
		items = null;
		data = getCompiledElement(items, filters);
		expect(data.length).toBe(0);
	});

	it('testing filter IO core', () => {
		const res = FilterIoCore.getFiltredCollection(itemsMock, [{'type': 'productName', 'typeValue': 'Office Standard', 'signature': 'NameObject_001'}], false);
		expect(res.length).toBe(1);
	})
});
