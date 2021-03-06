/**
 * getObjectValueFromString - Process and returns the value of the property found from given string
 *
 * @param  {object} o object to look at
 * @param  {string} s string to process
 * @return {type}     returns the value of property found from the given string
 */

/* eslint-disable */
export function getObjectValueFromString(o, s) {
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
 * @param  {string}  el        Item property string retrieved from the list of properties from
 * each item
 * @param  {string}  flt       Filter string retrieved from the list of filters
 * @param  {boolean} isPartial Filters partially when true, or exact otherwise
 * @return {boolean}           Returns true if the element is found in the array
 */
export function isInArray(el, flt, isPartial) {
  return isPartial ? el.indexOf(flt) > -1 : el === flt;
}

export function getObjectFromArray(arr) {
  const obj = {};

  arr.forEach((el) => {
    obj[el.type] = el;
  });

  return obj;
}


/**
 * getLowrCaseOrNumber - Returns the same value, but converted into float if number, or lowercase
 * if string
 * This is to facilitate the comparission
 *
 * @param  {any} value to process
 * @return {type} processed value
 */
export function getLowerCaseOrNumber(el) {
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
 * @param  {boolean} isPartial  If true, the match rule will be equal|contained in. If false,
 * it'll be equal.
 * @return {boolean}            Returns boolean for element found condition
 */
export function atLeastOneMatch(fltrs, element, isPartial) {
  let counter = 0;
  let filters = fltrs;
  let el = element;

  // Unify filters. Make it an array if it isn't yet
  if (!Array.isArray(fltrs)) {
    filters = [fltrs];
  }

  filters.forEach((filter) => {
    let flt = filter;
    // VALIDATIONS

    flt = getLowerCaseOrNumber(flt);
    el = getLowerCaseOrNumber(el);

    if (typeof el !== typeof flt) {
      return;
    }

    if (el === flt) {
      counter += 1;
      return;
    }

    if (!filters.length || (el && el.length && isInArray(el, flt, isPartial))) {
      counter += 1;
      // eslint-disable-next-line
      return;
    }
  });

  return !!counter;
}
