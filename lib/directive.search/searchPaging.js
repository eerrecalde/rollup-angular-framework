export default function searchPaging(legacyFactory, stateProcessFactory, SearchPagingFactory){
    var ctpSearchPagingRequester = {};
    ctpSearchPagingRequester.restrict = 'E';
    ctpSearchPagingRequester.scope = true;

    ctpSearchPagingRequester.link = function(scope, element, attrs){
        var legacy = legacyFactory.legacyMode(attrs.legacy, 'ctpSearchPagingRequester');
        scope[attrs.scopeprefix] = { _state : stateProcessFactory.create(['processData'])};
        legacyFactory.returnStatus(scope[attrs.scopeprefix], 'pending', legacy);

        scope.$watchGroup([
                function() { return attrs.scopeprefix; },
                function() { return attrs.trilike; },
                function() { return attrs.queryString; },

                // trigram attributes
                function() { return attrs.orgLegalName; },
                function() { return attrs.orgAddress; },
                function() { return attrs.orgWebsite;},
                function() { return attrs.orgPhone;},
                function() { return attrs.orgEmal;},
                function() {return attrs.legalId;},
                function() {return attrs.rankThreshold;},

                function() { return attrs.signatureList; },
                function() { return attrs.size; },
                function() { return attrs.returnMode; },
                function() { return attrs.useAppApiKey; },
                function() { return attrs.shard; },
                function() { return attrs.mode; },
                function() { return attrs.queryBypassSimilarity;},
                function() { return attrs.queryBypassPrivacy; },
                function() { return attrs.partition; }
            ],
            function(){

                var searchData = new SearchPagingFactory(attrs.shard, attrs.partition, attrs.mode, attrs.trilike, attrs.queryString, JSON.parse(attrs.signatureList), attrs.size, attrs.returnMode, undefined, attrs.rankThreshold, attrs.orgLegalName, attrs.orgAddress, attrs.orgWebsite, attrs.orgPhone, attrs.orgEmail, attrs.legalId, attrs.useAppApiKey, attrs.queryBypassSimilarity, attrs.queryBypassPrivacy);
                scope[attrs.scopeprefix] = legacyFactory.returnData(searchData, legacy);
                legacyFactory.returnStatus(scope[attrs.scopeprefix], 'success', legacy);
                var data = scope[attrs.scopeprefix];
                if(!legacy){
                    data = scope[attrs.scopeprefix]._data;
                }
                data.nextPage();
            });
    };

    return ctpSearchPagingRequester;
};
