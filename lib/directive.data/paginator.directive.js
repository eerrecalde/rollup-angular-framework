import mod from './0module';

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
mod.directive('ctpPaginator', () => {

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
 });
