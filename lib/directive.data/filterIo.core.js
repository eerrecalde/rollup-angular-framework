const FilterIoCore = (function() {
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

    filters.forEach(function(flt) {
      // VALIDATIONS
      if(isNaN(flt)) {
        // To lowercase before comparing.
        flt = flt.toLowerCase();
      } else {
        // To number before comparing.
        flt = parseFloat(flt);
      }

      if(isNaN(el)) {
        // To lowercase before comparing.
        el = el.toLowerCase();
      } else {
        // To number before comparing.
        el = parseFloat(el);
      }

      if(typeof el !== typeof flt) {
        return;
      }

      if(el === flt) {
        counter += 1;
        return;
      }

      if(!filters.length || (el && isInArray(el, flt, isPartial))) {
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
          var keys = Object.keys(filterUnit);

          keys.forEach(function(k) {
            var key = k;
            var fltrU = filterUnit;

            if(!key || !fltrU[key] || !item[key]) {
              return;
            }

            if(typeof fltrU[key] !== 'object') {
              fltrU[key] = [fltrU[key]];
            }

            if(atLeastOneMatch(fltrU[key], item[key], isPartial)) {
              filtersMatchingCounter += 1;
            }

            return;
          });

          if(filtersMatchingCounter === keys.length) {
            ioObjectMatchingCounter += 1;
          }

        });

        return ioObjectMatchingCounter === filters.length;
      }).length > 0;
    });
  };

  return {
    getFiltredCollection: getFiltredCollection
  }
}())

export default FilterIoCore;
