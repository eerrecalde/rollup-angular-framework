import * as Utils from '../utils/utils';

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

          if(!item[key] && Utils.getObjectValueFromString(item, key) !== undefined) {
            // console.log('Utils item', item);
            // console.log('Utils key', key);
            propInItem = Utils.getObjectValueFromString(item, key);
          }

          if(key === 'undefined' || filterUnit[key] === 'undefined') {
            return;
          }

          if(propInItem && Utils.atLeastOneMatch(filterUnit[key], propInItem, isPartial)) {
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
};

const FilterIoCore = {
  getFiltredCollection,
};

export default FilterIoCore
