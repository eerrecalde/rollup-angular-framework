(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('angular')) :
	typeof define === 'function' && define.amd ? define(['exports', 'angular'], factory) :
	(factory((global.libMod = {}),global.angular));
}(this, (function (exports,angular) { 'use strict';

angular = angular && angular.hasOwnProperty('default') ? angular['default'] : angular;

var directiveData = angular.module('directive.data', []);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var FilterIoCore = function () {
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
   * atLeastOneMatch - Returns true if 1 of the elements matches the criteria
   *
   * @param  {array}   filters    List of filters match against
   * @param  {string}  el         Element to look for in the filters array
   * @param  {boolean} isPartial  If true, the match rule will be equal|contained in. If false, it'll be equal.
   * @return {boolean}            Returns boolean for element found condition
   */
  function atLeastOneMatch(filters, el, isPartial) {
    var counter = 0;

    filters.forEach(function (flt) {
      // VALIDATIONS
      if (isNaN(flt)) {
        // To lowercase before comparing.
        flt = flt.toLowerCase();
      } else {
        // To number before comparing.
        flt = parseFloat(flt);
      }

      if (isNaN(el)) {
        // To lowercase before comparing.
        el = el.toLowerCase();
      } else {
        // To number before comparing.
        el = parseFloat(el);
      }

      if ((typeof el === 'undefined' ? 'undefined' : _typeof(el)) !== (typeof flt === 'undefined' ? 'undefined' : _typeof(flt))) {
        return;
      }

      if (el === flt) {
        counter += 1;
        return;
      }

      if (!filters.length || el && isInArray(el, flt, isPartial)) {
        counter += 1;
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
  var getFiltredCollection = function getFiltredCollection(items, filters, isPartial) {
    if (!filters || !filters.length) {
      return items;
    }

    return items.filter(function (j) {
      var ioObjectMatchingCounter = 0;

      return j.data.io.filter(function (item) {

        filters.forEach(function (filterUnit) {
          var filtersMatchingCounter = 0;
          var keys = Object.keys(filterUnit);

          keys.forEach(function (k) {
            var key = k;
            var fltrU = filterUnit;

            if (!key || !fltrU[key] || !item[key]) {
              return;
            }

            if (_typeof(fltrU[key]) !== 'object') {
              fltrU[key] = [fltrU[key]];
            }

            if (atLeastOneMatch(fltrU[key], item[key], isPartial)) {
              filtersMatchingCounter += 1;
            }

            return;
          });

          if (filtersMatchingCounter === keys.length) {
            ioObjectMatchingCounter += 1;
          }
        });

        return ioObjectMatchingCounter === filters.length;
      }).length > 0;
    });
  };

  return {
    getFiltredCollection: getFiltredCollection
  };
}();

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
directiveData.directive('ctpPaginator', function () {

  var paginator = {};

  paginator.restrict = 'E';
  paginator.link = function (scope, element, attrs) {

    var data = {};
    var dataReceived = {};

    if (attrs.items) {
      data.items = attrs.items;
    }

    data.itemsPerPage = attrs.itemsPerPage;

    data.currentPage = parseInt(attrs.currentPage) || 0;

    /**
     * getNumberOfPages - Gets number of pages from given items length and page size
     *
     * @return {number}  Returns calculation of number of pages
     */
    function getNumberOfPages(iLength, itemsPerPage) {
      return Math.ceil(iLength / itemsPerPage);
    }

    /**
     * generatePagesArray - Generates page array to be used as repeater for page indexes creation
     *
     * @return {array}  Return an array from 1 to n where n is the amount of pages.
     */
    function generatePagesArray(numberOfPages) {
      var arr = [],
          max = numberOfPages;

      for (var i = 0; i < max; i++) {
        arr.push(i);
      }

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
      var start = currPage * itemsPerPage; //parse to int
      return items.slice(start, start + itemsPerPage);
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
     * fillUpScopePrefix - Fills up scopeprefix variable with data object
     *
     * @return {undefined}      undefined
     */
    function fillUpScopePrefix() {
      if (data.items && data.items.length) {
        if (!data.itemsPerPage) {
          data.itemsPerPage = data.items.length;
        }
        data.pagesArray = generatePagesArray(getNumberOfPages(data.items.length, data.itemsPerPage));
        if (dataReceived.currentPage && dataReceived.itemsPerPage && dataReceived.items && data.currentPage >= data.pagesArray.length) {
          data.currentPage = data.pagesArray.length - 1;
        }
        data.paginatedItems = getFiltredItems(data['items'], data.currentPage, data.itemsPerPage);
        scope[attrs.scopeprefix] = data;
      } else {
        scope[attrs.scopeprefix] = {
          items: [],
          paginatedItems: [],
          pagesArray: []
        };
      }
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
      var toItemIndex = data.currentPage * data.itemsPerPage + data.itemsPerPage;
      return toItemIndex > data.items.length ? data.items.length : toItemIndex;
    };

    /**
     * paginate - Updates currentPage based on the parameter passed.
     *
     * @param  {number|string} page  Accepts either next/prev or a number corresponding to the page number.
     * @return {undefined}                undefined
     */
    data.paginate = function (page) {
      if (typeof page === 'string' && page.indexOf('prev') > -1) {
        data.currentPage = data.currentPage - 1;
      } else if (typeof page === 'string' && page.indexOf('next') > -1) {
        data.currentPage = data.currentPage + 1;
      } else {
        if (data.currentPage === parseInt(page)) {
          return;
        }
        data.currentPage = parseInt(page);
      }

      fillUpScopePrefix();
    };

    /**
     * setItemsPerPage - Updates the value of items per page according to the parameters passed
     *
     * @param  {number} size    Number of items per page
     * @return {undefined}      undefined
     */
    data.setItemsPerPage = function (size) {
      data.itemsPerPage = parseInt(size);
      fillUpScopePrefix();
    };

    scope.$watchCollection(attrs.items, function (newValue, oldValue) {
      fillUpDataObject(newValue, 'items');
    });

    scope.$watchCollection(attrs.currentPage, function (newValue, oldValue) {
      if (newValue !== undefined) {
        fillUpDataObject(newValue === null ? 0 : newValue, 'currentPage');
      }
    });

    scope.$watchCollection(attrs.itemsPerPage, function (newValue, oldValue) {
      if (newValue !== undefined) {
        fillUpDataObject(newValue, 'itemsPerPage');
      }
    });
  };

  return paginator;
});

var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Tree Shaking test. I'm including this, but not using.
// Rollup is smart enough to leave this out the bundle.
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

directiveData.directive('ctpFilterIo', function () {

  var ctpFilterIo = {};
  ctpFilterIo.restrict = 'E';

  ctpFilterIo.link = function (scope, element, attrs) {

    var data = {
      filterArray: [],
      itemsArray: null,
      isPartial: null,
      func: null
    };

    /**
     * var fillUpScopePrefix - Prepares data object to be processed
     *
     * @param  {object} obj  object that has been updated
     * @param  {string} type attribute that has been updated
     * @return {undefined}   undefined
     */
    var fillUpScopePrefix = function fillUpScopePrefix(obj, type) {
      // This is just in case usr sends the product object rather than the product.items array
      if (obj) {
        data[type] = obj.items || obj;
      }

      if (data['itemsArray'] && _typeof$1(data['itemsArray']) === 'object') {
        scope[attrs.scopeprefix] = FilterIoCore.getFiltredCollection(data['itemsArray'], data['filterArray'], data['isPartial']);
      } else {
        scope[attrs.scopeprefix] = [];
      }
    };

    scope.$watchCollection(attrs.items, function (newValue, oldValue) {
      fillUpScopePrefix(newValue, 'itemsArray');
    });

    scope.$watchCollection(attrs.filters, function (newValue, oldValue) {
      fillUpScopePrefix(newValue, 'filterArray');
    });

    scope.$watchCollection(attrs.isPartial, function (newValue, oldValue) {
      fillUpScopePrefix(newValue, 'isPartial');
    });
  };

  return ctpFilterIo;
});

var directiveSearch = angular.module('directive.search', []);

function searchPaging(legacyFactory, stateProcessFactory, SearchPagingFactory) {
    var ctpSearchPagingRequester = {};
    ctpSearchPagingRequester.restrict = 'E';
    ctpSearchPagingRequester.scope = true;

    ctpSearchPagingRequester.link = function (scope, element, attrs) {
        var legacy = legacyFactory.legacyMode(attrs.legacy, 'ctpSearchPagingRequester');
        scope[attrs.scopeprefix] = { _state: stateProcessFactory.create(['processData']) };
        legacyFactory.returnStatus(scope[attrs.scopeprefix], 'pending', legacy);

        scope.$watchGroup([function () {
            return attrs.scopeprefix;
        }, function () {
            return attrs.trilike;
        }, function () {
            return attrs.queryString;
        },

        // trigram attributes
        function () {
            return attrs.orgLegalName;
        }, function () {
            return attrs.orgAddress;
        }, function () {
            return attrs.orgWebsite;
        }, function () {
            return attrs.orgPhone;
        }, function () {
            return attrs.orgEmal;
        }, function () {
            return attrs.legalId;
        }, function () {
            return attrs.rankThreshold;
        }, function () {
            return attrs.signatureList;
        }, function () {
            return attrs.size;
        }, function () {
            return attrs.returnMode;
        }, function () {
            return attrs.useAppApiKey;
        }, function () {
            return attrs.shard;
        }, function () {
            return attrs.mode;
        }, function () {
            return attrs.queryBypassSimilarity;
        }, function () {
            return attrs.queryBypassPrivacy;
        }, function () {
            return attrs.partition;
        }], function () {

            var searchData = new SearchPagingFactory(attrs.shard, attrs.partition, attrs.mode, attrs.trilike, attrs.queryString, JSON.parse(attrs.signatureList), attrs.size, attrs.returnMode, undefined, attrs.rankThreshold, attrs.orgLegalName, attrs.orgAddress, attrs.orgWebsite, attrs.orgPhone, attrs.orgEmail, attrs.legalId, attrs.useAppApiKey, attrs.queryBypassSimilarity, attrs.queryBypassPrivacy);
            scope[attrs.scopeprefix] = legacyFactory.returnData(searchData, legacy);
            legacyFactory.returnStatus(scope[attrs.scopeprefix], 'success', legacy);
            var data = scope[attrs.scopeprefix];
            if (!legacy) {
                data = scope[attrs.scopeprefix]._data;
            }
            data.nextPage();
        });
    };

    return ctpSearchPagingRequester;
}

directiveSearch.directive('ctpSearchPagingRequester', ['legacyFactory', 'stateProcessFactory', 'searchPagingFactory', searchPaging]);

exports.FilterIoCore = FilterIoCore;
exports.directiveData = directiveData;
exports.directiveSearch = directiveSearch;

Object.defineProperty(exports, '__esModule', { value: true });

})));
