'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var angular = _interopDefault(require('angular'));

var directiveData = angular.module('directive.data', []);

const FilterIoCore = (function filterIo() {
  /**
   * getObjectValueFromString - Process and returns the value of the property found from given string
   *
   * @param  {object} o object to look at
   * @param  {string} s string to process
   * @return {type}     returns the value of property found from the given string
   */

  /* eslint-disable */
  function getObjectValueFromString(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, ''); // strip a leading dot
    const a = s.split('.');
    for (let i = 0, n = a.length; i < n; i+=1) {
      const k = a[i];
      if (k in o) {
        o = o[k];
      } else {
        return;
      }
    }
    return o;
  }
  /* eslint-enable */


  /**
   * isInArray - Returns true if the element is found in the array.
   *
   * @param  {string}  el        Item property string retrieved from the list of properties from each item
   * @param  {string}  flt       Filter string retrieved from the list of filters
   * @param  {boolean} isPartial Filters partially when true, or exact otherwise
   * @return {boolean}           Returns true if the element is found in the array
   */
  function isInArray(el, flt, isPartial) {
    return isPartial ? el.indexOf(flt) > -1 : el === flt;
  }


  /**
   * getLowrCaseOrNumber - Returns the same value, but converted into float if number, or lowercase if string
   * This is to facilitate the comparission
   *
   * @param  {any} value to process
   * @return {type} processed value
   */
  function getLowerCaseOrNumber (el) {
    if(typeof el === 'number') {
      return parseFloat(el);
    }

    if(typeof el === 'string') {
      // eslint-disable-next-line
      return isNaN(el) ? el.toLowerCase() : parseFloat(el);
    }

    return el;
  }

  /**
   * atLeastOneMatch - Returns true if 1 of the elements matches the criteria
   *
   * @param  {array}   filters    List of filters match against
   * @param  {string}  el         Element to look for in the filters array
   * @param  {boolean} isPartial  If true, the match rule will be equal|contained in. If false, it'll be equal.
   * @return {boolean}            Returns boolean for element found condition
   */
  function atLeastOneMatch(fltrs, element, isPartial) {
    let counter = 0;
    let filters = fltrs;
    let el = element;

    // Unify filters. Make it an array if it isn't yet
    if(!Array.isArray(fltrs)) {
      filters = [fltrs];
    }

    filters.forEach((filter) => {
      let flt = filter;
      // VALIDATIONS

      flt = getLowerCaseOrNumber(flt);
      el = getLowerCaseOrNumber(el);

      if(typeof el !== typeof flt) {
        return;
      }

      if(el === flt) {
        counter += 1;
        return;
      }

      if(!filters.length || (el && el.length && isInArray(el, flt, isPartial))) {
        counter += 1;
        // eslint-disable-next-line
        return;
      }
    });

    return !!counter;
  }

  /**
   * var getFiltredCollection - Filters given array against given filters.
   *
   * @param  {array} items   Array to loop through
   * @param  {array} filters Filters to be used to remove or not elements from the resulting array
   * @return {array}         Final filtred array
   */
  function getFiltredCollection (items, filters, isPartial) {
    if (!filters || !filters.length) {return items;}

    return items.filter((j) => {
      let ioObjectMatchingCounter = 0;

      return j.data.io.filter((item) => {

        filters.forEach((filterUnit) => {
          let filtersMatchingCounter = 0;
          const filterKeys = Object.keys(filterUnit);

          filterKeys.forEach((key) => {
            let propInItem = item[key] || undefined;

            if(!item[key] && getObjectValueFromString(item, key) !== undefined) {
              propInItem = getObjectValueFromString(item, key);
            }

            if(key === 'undefined' || filterUnit[key] === 'undefined') {
              return;
            }

            if(propInItem && atLeastOneMatch(filterUnit[key], propInItem, isPartial)) {
              filtersMatchingCounter += 1;
            }

            // eslint-disable-next-line
            return;
          });

          if(filtersMatchingCounter === filterKeys.length) {
            ioObjectMatchingCounter += 1;
          }

        });

        return ioObjectMatchingCounter === filters.length;
      }).length > 0;
    });
  }

  return {
    getFiltredCollection,
  }
}());

/**
 * @ngdoc directive
 * @name directive.data.directive:ctpPaginator
 * @restrict E
 *
 * @description
 * Author Emiliano Errecalde
 *
 * Date 07/07/17
 *
 * Return a subset of element according to the parameters passed.
 *
 * @param {array} items Items to create pagination from
 * @param {number} [itemsPerPage=items.length] Amount of elements per page. I will default to the length of items list
 * @param {number} [currentPage=0] Page number to start with, (0 is the first page)
 * @param {object} scopeprefix Variable to store the resulting items after processed
 */
directiveData.directive('ctpPaginator', () => {

   const paginator = {};

   paginator.restrict = 'E';
   paginator.link = function(scope, element, attrs) {

     const data = {};
     const dataReceived = {};

     if(attrs.items) {
       data.items = attrs.items;
     }

     data.itemsPerPage = attrs.itemsPerPage;

     data.currentPage = parseInt(attrs.currentPage, 10) || 0;


     /**
      * getNumberOfPages - Gets number of pages from given items length and page size
      *
      * @return {number}  Returns calculation of number of pages
      */
     function getNumberOfPages(iLength, itemsPerPage){
       return Math.ceil(iLength / itemsPerPage);
     }

     /**
      * generatePagesArray - Generates page array to be used as repeater for page indexes creation
      *
      * @return {array}  Return an array from 1 to n where n is the amount of pages.
      */
     function generatePagesArray(numberOfPages){
       const arr = [];
       const max = numberOfPages;

       for (let i = 0; i < max; i += 1) { arr.push(i); }

       return arr;
     }


     /**
      * getFiltredItems - Generates subset of items from provided page details.
      *
      * @param  {array} items      List of items
      * @param  {number} currPage  Current page number
      * @param  {number} itemsPerPage  Desired page size
      * @return {array}            Subset of items
      */
     function getFiltredItems(items, currPage, itemsPerPage) {
       const start = currPage * itemsPerPage; // parse to int
       return items.slice(start, start + itemsPerPage);
     }

     /**
      * fillUpScopePrefix - Fills up scopeprefix variable with data object
      *
      * @return {undefined}      undefined
      */
     function fillUpScopePrefix() {
       if(data.items && data.items.length) {
         if(!data.itemsPerPage) {
           data.itemsPerPage = data.items.length;
         }
         data.pagesArray = generatePagesArray(getNumberOfPages(data.items.length, data.itemsPerPage));
         if(dataReceived.currentPage && dataReceived.itemsPerPage &&
           dataReceived.items && data.currentPage >= data.pagesArray.length) {
           data.currentPage = data.pagesArray.length - 1;
         }
         data.paginatedItems = getFiltredItems(data.items, data.currentPage, data.itemsPerPage);
         scope[attrs.scopeprefix] = data;
       } else {
         scope[attrs.scopeprefix] = {
           items: [],
           paginatedItems: [],
           pagesArray: [],
         };
       }
     }

     /**
      * fillUpData - Fills up data object with provided values from attributes
      *
      * @param  {any} val        Any value
      * @param  {string} type    Property to fill up
      * @return {undefined}      undefined
      */
     function fillUpDataObject(val, type) {
       data[type] = val;
       dataReceived[type] = true;
       fillUpScopePrefix();
     }


     /**
      * getItemFrom function - Calculates the itemFrom value based on current itemsPerPage and currentPage.
      *
      * @return {number}  Returns first item index shown in list.
      */
     data.getItemFrom = function () {
       return data.currentPage * data.itemsPerPage + 1;
     };


     /**
      * getItemTo function - Calculates the itemTo value based on current itemsPerPage and currentPage.
      *
      * @return {number}  Returns last item index shown in list.
      */
     data.getItemTo = function () {
       const toItemIndex = data.currentPage * data.itemsPerPage + data.itemsPerPage;
       return (toItemIndex > data.items.length) ? data.items.length : toItemIndex;
     };


     /**
      * paginate - Updates currentPage based on the parameter passed.
      *
      * @param  {number|string} page  Accepts either next/prev or a number corresponding to the page number.
      * @return {undefined}                undefined
      */
     data.paginate = function(page) {
       if(typeof page === 'string' && page.indexOf('prev') > -1) {
         data.currentPage -= 1;
       } else if (typeof page === 'string' && page.indexOf('next') > -1) {
         data.currentPage += 1;
       } else {
         if(data.currentPage === parseInt(page, 10)) {
           return;
         }
         data.currentPage = parseInt(page, 10);
       }

       fillUpScopePrefix();
     };


     /**
      * setItemsPerPage - Updates the value of items per page according to the parameters passed
      *
      * @param  {number} size    Number of items per page
      * @return {undefined}      undefined
      */
     data.setItemsPerPage = function(size) {
       data.itemsPerPage = parseInt(size, 10);
       fillUpScopePrefix();
     };

     scope.$watchCollection(attrs.items, (newValue) => {
       fillUpDataObject(newValue, 'items');
     });

 		scope.$watchCollection(attrs.currentPage, (newValue) => {
       if(newValue !== undefined) {
         fillUpDataObject((newValue === null) ? 0 : newValue, 'currentPage');
       }
 		});

     scope.$watchCollection(attrs.itemsPerPage, (newValue) => {
       if(newValue !== undefined) {
         fillUpDataObject(newValue, 'itemsPerPage');
       }
 		});

   };

   return paginator;
 })

// Tree Shaking test. I'm including this, but not using.
// Rollup is smart enough to leave this out the bundle.
// eslint-disable-next-line no-unused-vars
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

})

var directiveSearch = angular.module('directive.search', []);

function searchPaging(legacyFactory, stateProcessFactory, SearchPagingFactory){
    const ctpSearchPagingRequester = {};
    ctpSearchPagingRequester.restrict = 'E';
    ctpSearchPagingRequester.scope = true;

    ctpSearchPagingRequester.link = function(scope, element, attrs){
        const legacy = legacyFactory.legacyMode(attrs.legacy, 'ctpSearchPagingRequester');
        scope[attrs.scopeprefix] = { _state : stateProcessFactory.create(['processData'])};
        legacyFactory.returnStatus(scope[attrs.scopeprefix], 'pending', legacy);

        scope.$watchGroup([
                function() { return attrs.scopeprefix; },
                function() { return attrs.trilike; },
                function() { return attrs.queryString; },

                // trigram attributes
                function() { return attrs.orgLegalName; },
                function() { return attrs.orgAddress; },
                function() { return attrs.orgWebsite;},
                function() { return attrs.orgPhone;},
                function() { return attrs.orgEmal;},
                function() {return attrs.legalId;},
                function() {return attrs.rankThreshold;},

                function() { return attrs.signatureList; },
                function() { return attrs.size; },
                function() { return attrs.returnMode; },
                function() { return attrs.useAppApiKey; },
                function() { return attrs.shard; },
                function() { return attrs.mode; },
                function() { return attrs.queryBypassSimilarity;},
                function() { return attrs.queryBypassPrivacy; },
                function() { return attrs.partition; },
            ],
            () => {

                const searchData = new SearchPagingFactory(attrs.shard, attrs.partition, attrs.mode, attrs.trilike,
                  attrs.queryString, JSON.parse(attrs.signatureList), attrs.size, attrs.returnMode, undefined,
                  attrs.rankThreshold, attrs.orgLegalName, attrs.orgAddress, attrs.orgWebsite, attrs.orgPhone,
                  attrs.orgEmail, attrs.legalId, attrs.useAppApiKey, attrs.queryBypassSimilarity,
                  attrs.queryBypassPrivacy);
                scope[attrs.scopeprefix] = legacyFactory.returnData(searchData, legacy);
                legacyFactory.returnStatus(scope[attrs.scopeprefix], 'success', legacy);
                let data = scope[attrs.scopeprefix];
                if(!legacy){
                  // eslint-disable-next-line
                    data = scope[attrs.scopeprefix]._data;
                }
                data.nextPage();
            });
    };

    return ctpSearchPagingRequester;
}

directiveSearch.directive('ctpSearchPagingRequester',
  ['legacyFactory', 'stateProcessFactory','searchPagingFactory', searchPaging]);

exports.directiveDataModule = directiveData;
exports.FilterIoCore = FilterIoCore;
exports.directiveSearchModule = directiveSearch;