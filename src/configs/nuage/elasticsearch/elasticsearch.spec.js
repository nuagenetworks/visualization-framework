import { ElasticSearchService, getCurrentConfig } from "./index";


describe('Elastic Search service', () => {
    it('should expose certain methods and have an id', () => {
        let expectedProperties = [
            "id",
            "fetch",
            "ping",
            "getRequestID",
        ];
        expect(Object.keys(ElasticSearchService)).toEqual(expectedProperties)
        expect(ElasticSearchService.id).toEqual("elasticsearch")
    });
});


describe('Elastic Search getRequestID', () => {
    it('should return a stringify version of the query', () => {
        let query = {
                id: "ABC"
            },
            context = {
                enterpriseName: "Nuage Networks"
            };
        expect(ElasticSearchService.getRequestID(query, context)).toEqual("ABC[{\"enterpriseName\":\"Nuage Networks\"}]");
    });
});


describe('Elastic Search config', () => {
    it('should fetch information from the default host', () => {
        delete process.env.REACT_APP_ELASTICSEARACH_HOST;
        let config = getCurrentConfig();
        expect(config.host).toEqual("http://localhost:9200");
    });

    it('should fetch information from the environment variable host', () => {
        process.env.REACT_APP_ELASTICSEARACH_HOST = "https://www.google.com";
        let config = getCurrentConfig();
        expect(config.host).toEqual("https://www.google.com");
    });
});
