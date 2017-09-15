import directiveSearch from './0module';
import searchPaging from './searchPaging';

export default directiveSearch.directive('ctpSearchPagingRequester',
  ['legacyFactory', 'stateProcessFactory','searchPagingFactory', searchPaging]);
