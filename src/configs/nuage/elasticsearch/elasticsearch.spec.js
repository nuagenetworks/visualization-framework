import { ElasticSearchService, getCurrentConfig } from "./index";
import { Map } from "immutable";
import { ActionKeyStore } from "./redux/actions";


describe('Elastic Search service', () => {
    it('should expose certain methods and have an id', () => {
        let expectedProperties = [
            "id",
            "fetch",
            "ping",
            "getRequestID",
            "addSorting", 
            "addSearching", 
            "tabify", 
            "ESClient", 
            "getPageSizePath", 
            "updatePageSize", 
            "getNextPageQuery",
        ];
        expect(Object.keys(ElasticSearchService)).toEqual(expectedProperties)
        expect(ElasticSearchService.id).toEqual("elasticsearch")
    });
});


describe('Elastic Search getRequestID', () => {
    it('should return a stringify version of the query without parameters', () => {
        let query = {
                id: "ABC"
            },
            context = {
                enterpriseName: "Nuage Networks"
            };
        expect(ElasticSearchService.getRequestID(query, context)).toEqual("ABC");
    });

    it('should return a stringify version of the query with all used parameters', () => {
        let query = {
                id: "ABC",
                query: {
                    randomFilter: "{{enterpriseName}}"
                }
            },
            context = {
                enterpriseName: "Nuage Networks"
            };
        expect(ElasticSearchService.getRequestID(query, context)).toEqual("undefined-ABC[{\"enterpriseName\":\"Nuage Networks\"}]");
    });

});


describe('Elastic Search config', () => {

    it('should fetch information from the specified context', () => {
        const fakeState = {
            ES: Map({
                [ActionKeyStore.ES_HOST]: "http://eshost:9200"
            })
        };

        let config = getCurrentConfig(fakeState);
        expect(config.host).toEqual("http://eshost:9200");
    });

    it('should have no default host', () => {

        const fakeState = {
            ES: new Map()
        };

        delete process.env.REACT_APP_ELASTICSEARCH_HOST;
        let config = getCurrentConfig(fakeState);
        expect(config.host).toEqual('http://localhost:9200');
    });
});
