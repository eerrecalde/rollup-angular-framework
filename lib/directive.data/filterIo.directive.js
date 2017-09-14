import directiveData from './0module';
import FilterIoCore from './filterIo.core';

// Tree Shaking test. I'm including this, but not using.
// Rollup is smart enough to leave this out the bundle.
// eslint-disable-next-line no-unused-vars
import testingTS from './testingTS';

/**
 * @ngdoc directive
 * @name directive.data.directive:ctpFilterIo
 * @restrict E
 *
 * @description
 * Author Emiliano
 *
 * Date 23/06/17
 *
 * Returns an array of objects based on the parameters
 *
 * @param {array} items Items must be in ctp format, such as the resulting array from a ctp data requester.
 * @param {array} filters Filters to be used against the list of items. Must be an array of objects,
 * in which each object will have the format: {type: <String>, filterList: <Array>} where 'type' is
 * the type in the data.io array to filter by.
 *
 * Filters could come in any of these forms (or its combinations):
 *
 * 1) [{propA: 'value', propB: 'value', ..., propZ}]
 *
 * 2) [{propA: 'value', propB: ['value1', 'value2', 'value3']}]
 *
 * 3) [{propA: 'value', propB: 'value'}, {propA: 'value', propB: 'value'}]
 *
 * Where propA and propB can be any property in data.io object.
 *
 * Each object in the filters list represents a single data io object. So if we're looking to filter
 * for more than 1 object (such as brand and category), we should add more than 1 object in the filters
 * as you can see in the specs.
 *
 * @param {boolean} [isPartial=false] Will define the filter criteria with partial if true or exact otherwise
 * @param {array} scopeprefix Variable to store the resulting items after filter.
 */

directiveData.directive('ctpFilterIo', () => {

	const ctpFilterIo = {};
	ctpFilterIo.restrict = 'E';

	ctpFilterIo.link = function (scope, element, attrs) {

		const data = {
			filterArray: [],
			itemsArray: null,
			isPartial: null,
			func: null,
		};

		/**
		 * var fillUpScopePrefix - Prepares data object to be processed
		 *
		 * @param  {object} obj  object that has been updated
		 * @param  {string} type attribute that has been updated
		 * @return {undefined}   undefined
		 */
		const fillUpScopePrefix = function(obj, type) {
			// This is just in case usr sends the product object rather than the product.items array
			if(obj) {data[type] = obj.items || obj;}

      if(data.itemsArray && typeof data.itemsArray === 'object') {
				scope[attrs.scopeprefix] = FilterIoCore
          .getFiltredCollection(data.itemsArray, data.filterArray, data.isPartial);
			} else {
        scope[attrs.scopeprefix] = [];
      }
		};

    scope.$watchCollection(attrs.items, (newValue) => {
			fillUpScopePrefix(newValue, 'itemsArray');
    });

		scope.$watchCollection(attrs.filters, (newValue) => {
			fillUpScopePrefix(newValue, 'filterArray');
		});

    scope.$watchCollection(attrs.isPartial, (newValue) => {
			fillUpScopePrefix(newValue, 'isPartial');
		});

  };

  return ctpFilterIo;

});
