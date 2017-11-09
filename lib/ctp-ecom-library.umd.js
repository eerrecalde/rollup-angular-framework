(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.ctp_ecom_library = {})));
}(this, (function (exports) { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

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
  var a = s.split('.');
  for (var i = 0, n = a.length; i < n; i += 1) {
    var k = a[i];
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

function getObjectFromArray(arr) {
  var obj = {};

  arr.forEach(function (el) {
    obj[el.type] = el;
  });

  return obj;
}

/**
 * getLowrCaseOrNumber - Returns the same value, but converted into float if number, or lowercase if string
 * This is to facilitate the comparission
 *
 * @param  {any} value to process
 * @return {type} processed value
 */
function getLowerCaseOrNumber(el) {
  if (typeof el === 'number') {
    return parseFloat(el);
  }

  if (typeof el === 'string') {
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
  var counter = 0;
  var filters = fltrs;
  var el = element;

  // Unify filters. Make it an array if it isn't yet
  if (!Array.isArray(fltrs)) {
    filters = [fltrs];
  }

  filters.forEach(function (filter) {
    var flt = filter;
    // VALIDATIONS

    flt = getLowerCaseOrNumber(flt);
    el = getLowerCaseOrNumber(el);

    if ((typeof el === 'undefined' ? 'undefined' : _typeof(el)) !== (typeof flt === 'undefined' ? 'undefined' : _typeof(flt))) {
      return;
    }

    if (el === flt) {
      counter += 1;
      return;
    }

    if (!filters.length || el && el.length && isInArray(el, flt, isPartial)) {
      counter += 1;
      // eslint-disable-next-line
      return;
    }
  });

  return !!counter;
}

function testStuff() {
  console.log('testStuff');
}



var utils = Object.freeze({
	getObjectValueFromString: getObjectValueFromString,
	isInArray: isInArray,
	getObjectFromArray: getObjectFromArray,
	getLowerCaseOrNumber: getLowerCaseOrNumber,
	atLeastOneMatch: atLeastOneMatch,
	testStuff: testStuff
});

/**
 * var getFiltredCollection - Filters given array against given filters.
 *
 * @param  {array} items   Array to loop through
 * @param  {array} filters Filters to be used to remove or not elements from the resulting array
 * @return {array}         Final filtred array
 */
function getFiltredCollection(items, filters, isPartial) {
  if (!filters || !filters.length) {
    return items;
  }

  return items.filter(function (j) {
    var ioObjectMatchingCounter = 0;

    return j.data.io.filter(function (item) {
      filters.forEach(function (filterUnit) {
        var filtersMatchingCounter = 0;
        var filterKeys = Object.keys(filterUnit);

        filterKeys.forEach(function (key) {
          var propInItem = item[key] || undefined;

          if (!item[key] && getObjectValueFromString(item, key) !== undefined) {
            // console.log('Utils item', item);
            // console.log('Utils key', key);
            propInItem = getObjectValueFromString(item, key);
          }

          if (key === 'undefined' || filterUnit[key] === 'undefined') {
            return;
          }

          if (propInItem && atLeastOneMatch(filterUnit[key], propInItem, isPartial)) {
            filtersMatchingCounter += 1;
          }

          // eslint-disable-next-line
          return;
        });

        if (filtersMatchingCounter === filterKeys.length) {
          ioObjectMatchingCounter += 1;
        }
      });

      return ioObjectMatchingCounter === filters.length;
    }).length > 0;
  });
}

var FilterIoCore = {
  getFiltredCollection: getFiltredCollection
};

// eslint-disable-line

// eslint-disable-line

exports.FilterIoCore = FilterIoCore;
exports.Utils = utils;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ctp-ecom-library.umd.js.map
