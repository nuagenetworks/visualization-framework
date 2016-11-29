import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import $ from 'jquery';
import "whatwg-fetch";
import { VSDService, VSDServiceTest } from "./index";
import { Map } from "immutable";
import nock from 'nock';

import { ActionKeyStore } from "./redux/actions";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


describe('VSD service', () => {
    it('should expose certain methods and have an id', () => {
        let expectedProperties = [
            "id",
            "config",
            "getRequestID",
            "getMockResponse",
            "fetch"
        ];
        expect(Object.keys(VSDService)).toEqual(expectedProperties)
        expect(VSDService.id).toEqual("VSD")
    });

    it('should expose certain methods for tests', () => {
        let expectedProperties = [
            "makeRequest",
            "getURL",
        ];
        expect(Object.keys(VSDServiceTest)).toEqual(expectedProperties)
    });
});


describe('VSDService getRequestID', () => {
    it('should return the URL', () => {
        let configuration = {
            query: {
                parentResource: "enterprises",
                parentID: "{{enterpriseID}}",
                resource: "{{children}}"
            }},
            context = {
                enterpriseID: "1234",
                children: "domains",
            };
        expect(VSDService.getRequestID(configuration, context)).toEqual("enterprises/1234/domains");
    });

    it('should return defaut URL when context does not match', () => {
        let configuration = {
            query: {
                parentResource: "enterprises",
                parentID: "1234",
                resource: "domains"
            }},
            context = {};
        expect(VSDService.getRequestID(configuration, context)).toEqual("enterprises/1234/domains");
    });

    it('should return null when context does not allow to parameterize configuration', () => {
        let configuration = {
            query: {
                parentResource: "enterprises",
                parentID: "{{enterpriseID}}",
                resource: "domains"
            }},
            context = {
                enterpriseName: "ABC"
            };
        expect(VSDService.getRequestID(configuration, context)).toEqual(undefined);
    });
});


describe('VSDService fetch', () => {
    it('should fetch information from the default host', () => {
        process.env.REACT_APP_VSD_API_ENDPOINT = "http://localhost:8001/";

        let configuration = {
            query: {
                parentResource: "enterprises",
                parentID: "1234",
                resource: "domains"
            }
        };

        const headers = {
            "Accept": "*/*",
            "Authorization": "XREST 1234",
            "Content-Type": "application/json",
            "X-Nuage-Organization": "csp"
        }

        const fakeState = {
            VSD: Map({
                token: "1234",
            })
        };

        VSDServiceTest.makeRequest = jasmine.createSpy("makeRequest").and.callFake(() => {
            return Promise.resolve();
        });

        return VSDService.fetch(configuration, fakeState).then(
            (results) => {
                expect(VSDServiceTest.makeRequest).toHaveBeenCalled();
                expect(VSDServiceTest.makeRequest).toHaveBeenCalledWith("http://localhost:8001/nuage/api/v4_0/enterprises/1234/domains", headers);
            }
        );
    });


    it('should update the organization if provided', () => {
        process.env.REACT_APP_VSD_API_ENDPOINT = "http://localhost:8001/";

        let configuration = {
            query: {
                parentResource: "enterprises",
                parentID: "1234",
                resource: "domains"
            }
        };

        const headers = {
            "Accept": "*/*",
            "Authorization": "XREST 1234",
            "Content-Type": "application/json",
            "X-Nuage-Organization": "enterprise"
        }

        const fakeState = {
            VSD: Map({
                token: "1234",
                [ActionKeyStore.ORGANIZATION]: "enterprise"
            })
        };

        VSDServiceTest.makeRequest = jasmine.createSpy("makeRequest").and.callFake(() => {
            return Promise.resolve();
        });

        return VSDService.fetch(configuration, fakeState).then(
            (results) => {
                expect(VSDServiceTest.makeRequest).toHaveBeenCalled();
                expect(VSDServiceTest.makeRequest).toHaveBeenCalledWith("http://localhost:8001/nuage/api/v4_0/enterprises/1234/domains", headers);
            }
        );
    });
});
