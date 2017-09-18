import directiveDataModule from "./0module";
import paginatorDirective from "./paginator.directive";
import filterIoDirective from "./filterIo.directive";

// These will be available as separated modules.
export { paginatorDirective };
export { filterIoDirective };
export { FilterIoCore, TestingStuff } from "./filterIo.core";
export { directiveDataModule };
