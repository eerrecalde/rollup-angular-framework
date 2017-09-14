const FilterIoCore = (function filterIo() {
  /**
   * getObjectValueFromString - Process and returns the value of the property found from given string
   *
   * @param  {object} o object to look at
   * @param  {string} s string to process
   * @return {type}     returns the value of property found from the given string
   */
  function getObjectValueFromString(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, ''); // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in o) {
        o = o[k];
      } else {
        return;
      }
    }
    return o;
  }


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
  function atLeastOneMatch(filters, el, isPartial) {
    var counter = 0;

    // Unify filters. Make it an array if it isn't yet
    if(!Array.isArray(filters)) {
      filters = [filters];
    }

    filters.forEach(function(flt) {
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
  var getFiltredCollection = function(items, filters, isPartial) {
    if (!filters || !filters.length) {return items;}

    return items.filter(function (j) {
      var ioObjectMatchingCounter = 0;

      return j.data.io.filter(function (item) {

        filters.forEach(function(filterUnit) {
          var filtersMatchingCounter = 0;
          var filterKeys = Object.keys(filterUnit);

          filterKeys.forEach(function(key) {
            var propInItem = item[key] || undefined;

            if(!item[key] && getObjectValueFromString(item, key) !== undefined) {
              propInItem = getObjectValueFromString(item, key);
            }

            if(key === 'undefined' || filterUnit[key] === 'undefined') {
              return;
            }

            if(propInItem && atLeastOneMatch(filterUnit[key], propInItem, isPartial)) {
              filtersMatchingCounter += 1;
            }

            return;
          });

          if(filtersMatchingCounter === filterKeys.length) {
            ioObjectMatchingCounter += 1;
          }

        });

        return ioObjectMatchingCounter === filters.length;
      }).length > 0;
    });
  };

  return {
    getFiltredCollection,
  }
}())

export default FilterIoCore;
