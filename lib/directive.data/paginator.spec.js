import '../_mocks/queryAPImocks';
import './paginator.directive';

const { module } = angular.mock;

describe('Directive_Ctp_Paginator', function () {
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

	var getProcessedObject = function (i, itemsPP, currentP) {
		scope.pobj = {};
		scope.items = i;
		scope.currentPage = currentP;
		scope.itemsPerPage = itemsPP;

		var element = '<ctp-paginator items="items" current-page="currentPage" items-per-page="itemsPerPage" scopeprefix="pobj"></ctp-paginator>';
		element = compile(element)(scope);
		scope.$digest();
		return scope.pobj;
	};

	var items, currentPage, itemsPerPage, data;

	beforeEach(function () {
		inject(injectModules);
		items = '';
		currentPage = 0;
		itemsPerPage = 12;
		data = '';
		itemsMock = mockqueryAPIResponse[':37376/services/query/product:test:asynch/VALID_SESSION-ValidSessionValidProcessObjectQuery'].returnStatus.data.results;
	});

	it('When sending no items, it should return an object with empty arrays for items, paginatedItems, and pagesArray', function () {
		currentPage = 0;
		itemsPerPage = 2;
		items = [];
		data = getProcessedObject(items, itemsPerPage, currentPage);
		expect(data.items.length).toBe(0);
		expect(data.paginatedItems.length).toBe(0);
		expect(data.pagesArray.length).toBe(0);
	});

	it('When sending no currentPage, it should default to 0', function () {
		currentPage = null;
		itemsPerPage = 2;
		items = itemsMock;
		data = getProcessedObject(items, itemsPerPage, currentPage);
		expect(data.currentPage).toBe(0);
	});

	it('When sending no itemsPerPage, it should default to items.length', function () {
		currentPage = 0;
		itemsPerPage = null;
		items = itemsMock;
		data = getProcessedObject(items, itemsPerPage, currentPage);
		expect(data.itemsPerPage).toBe(items.length);
	});

	it('When sending 2 as itemsPerPage, it should return an array of 2 element in the paginatedItems property', function () {
		currentPage = 0;
		itemsPerPage = 2;
		items = itemsMock;
		data = getProcessedObject(items, itemsPerPage, currentPage);
		expect(data.itemsPerPage).toBe(items.length / itemsPerPage);
		expect(data.paginatedItems.length).toBe(items.length / itemsPerPage);
	});

	it('When sending 2 as itemsPerPage, it should match snapshot', function () {
		currentPage = 0;
		itemsPerPage = 2;
		items = itemsMock;
		data = getProcessedObject(items, itemsPerPage, currentPage);

		// taking less properties from the product list to facilitate the comparission.
		var data2 = data.paginatedItems.map(el => {
			var tmpObj = getObjectFromArray(el.data.io);
			return {productName: tmpObj.productName.typeValue, productCategory: tmpObj.productCategory.typeValue};
		});

		expect(JSON.stringify(data2)).toMatchSnapshot();
	});

	it('When sending 1 as current page, and 2 as itemsPerPage, getItemFrom should return 3, and getItemTo should return 4', function () {
		currentPage = 1;
		itemsPerPage = 2;
		items = itemsMock;
		data = getProcessedObject(items, itemsPerPage, currentPage);
		expect(data.currentPage).toBe(1);
		expect(data.getItemFrom()).toBe(3);
		expect(data.getItemTo()).toBe(4);
		data.items = data.items.slice(0, data.items.length - 1);
		expect(data.getItemTo()).toBe(3);
	});

	it('When paginate to 1, currentPage should be updated to 1', function () {
		currentPage = 0;
		itemsPerPage = 1;
		items = itemsMock;
		data = getProcessedObject(items, itemsPerPage, currentPage);
		expect(data.currentPage).toBe(0);
		data.paginate(1);
		expect(data.currentPage).toBe(1);
		data.paginate(1);
		expect(data.currentPage).toBe(1);
		data.paginate('next');
		expect(data.currentPage).toBe(2);
		data.paginate('prev');
		expect(data.currentPage).toBe(1);
	});

	it('When using setItemsPerPage, itemsPerPage should update', function () {
		currentPage = 0;
		itemsPerPage = 2;
		items = itemsMock;
		data = getProcessedObject(items, itemsPerPage, currentPage);
		expect(data.itemsPerPage).toBe(2);
		data.setItemsPerPage(3);
		expect(data.itemsPerPage).toBe(3);
	});

	it('When currentPage == 2, if the amount of pages gets less than 2, it should readjust currentPage to latest possible', function () {
		currentPage = 3;
		itemsPerPage = 1;
		items = itemsMock;
		data = getProcessedObject(items, itemsPerPage, currentPage);
		expect(data.currentPage).toBe(3);
		data.setItemsPerPage(2);
		expect(data.currentPage).toBe(1);
	});

});
