import directiveSearch from './0module';
import searchPaging from './searchPaging';

directiveSearch.directive('ctpSearchPagingRequester', ['legacyFactory', 'stateProcessFactory','searchPagingFactory', searchPaging]);
