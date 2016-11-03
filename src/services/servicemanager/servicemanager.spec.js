import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { Actions, ActionKeyStore, ActionTypes } from "./redux/actions";
import { ServiceManager } from "./index"
import servicesReducer from "./redux/reducer";
import { fromJS, Map } from "immutable";

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('ServiceManager', () => {
    it('should expose certain methods', () => {
        let expectedProperties = [
            "config",
            "register",
            "getService",
            "getRequestID",
            "executeScript"
        ];
        expect(Object.keys(ServiceManager)).toEqual(expectedProperties)
    });
});

describe('ServiceManager Actions: fetch', () => {

    beforeEach(() => {
        self.serviceName = "mockService";
        self.expectedResults = [{
            id: 1,
            name: "Result1",
        },
        {
            id: 2,
            name: "Result2",
        }];
        self.mockService = {
            id: self.serviceName,
            getRequestID: (query, context) => {
                return query.id
            },
            fetch: (query, state) => {
                return Promise.resolve(self.expectedResults)
            },
        };

        self.store = mockStore();
        self.configuration = {
            id: "example",
            service: self.serviceName,
            query: {
                name: "{{parameter}}"
            }
        };

        self.context = {
            parameter: "Example"
        };

        ServiceManager.register(self.mockService, self.mockService.id);
    });

    it('should fetch service results', () => {
        return self.store.dispatch(Actions.fetch(self.configuration, self.context))
             .then((response) => {
                 expect(response).toEqual(self.expectedResults);
             })
    });

    it('should dispatch didStartRequest and didReceiveResponse actions on success', () => {
        return self.store.dispatch(Actions.fetch(self.configuration, self.context))
             .then((response) => {
                 let actions = store.getActions();

                 expect(actions.length).toEqual(2)
                 expect(actions[0]).toEqual({
                     type: ActionTypes.SERVICE_MANAGER_DID_START_REQUEST,
                     requestID: self.configuration.id,
                 })
                 expect(actions[1]).toEqual({
                     type: ActionTypes.SERVICE_MANAGER_DID_RECEIVE_RESPONSE,
                     requestID: self.configuration.id,
                     results: self.expectedResults,
                     forceCache: undefined,
                 })
             })
    });

    it('should dispatch didStartRequest and didReceiveError actions on failure', () => {
        const expectedError = {
            "status": "401",
            "message": "Unknown error",
        };

        spyOn(self.mockService, 'fetch').and.callFake(() => {
            return Promise.reject(expectedError);
        });

        return self.store.dispatch(Actions.fetch(self.configuration, self.context))
             .then((response) => {
                 let actions = store.getActions();

                 expect(actions.length).toEqual(2)
                 expect(actions[0]).toEqual({
                     type: ActionTypes.SERVICE_MANAGER_DID_START_REQUEST,
                     requestID: self.configuration.id,
                 })
                 expect(actions[1]).toEqual({
                     type: ActionTypes.SERVICE_MANAGER_DID_RECEIVE_ERROR,
                     requestID: self.configuration.id,
                     error: expectedError,
                 })
             })
    });

});

describe('ServiceManager Actions: fetchIfNeeded', () => {

    beforeEach(() => {
        self.serviceName = "mockService";
        self.expectedResults = [{
            id: 1,
            name: "Result1",
        },
        {
            id: 2,
            name: "Result2",
        }];
        self.mockService = {
            id: self.serviceName,
            getRequestID: (query, context) => {
                return query.id
            },
            fetch: (query, state) => {
                return Promise.resolve(self.expectedResults)
            },
        };

        self.configuration = {
            id: "example",
            service: self.serviceName,
            query: {
                name: "{{parameter}}"
            }
        };

        self.context = {
            parameter: "Example"
        };

        ServiceManager.register(self.mockService, self.mockService.id);
    });

    it('should fetch if no results has been previsouly fetched', () => {
        const store = mockStore({
            services: Map(),
        });

        return store.dispatch(Actions.fetchIfNeeded(self.configuration, self.context))
             .then((response) => {
                 expect(response).toEqual(self.expectedResults);
             })
    });

    it('should not fetch results if service is currently fetching', () => {
        spyOn(self.mockService, 'fetch')

        const store = mockStore({
            services: Map({
                requests: Map().setIn([self.configuration.id, ActionKeyStore.IS_FETCHING], true),
            }),
        });

        return store.dispatch(Actions.fetchIfNeeded(self.configuration, self.context))
             .then((response) => {
                 expect(self.mockService.fetch).not.toHaveBeenCalled();
                 expect(response).toBeUndefined(); // WARN: ConfigurationManager does not return results from the current state
             })
    });

    it('should not fetch results if it has been already fetched', () => {
        spyOn(self.mockService, 'fetch')

        const currentDate    = new Date(),
              expirationDate = currentDate.setTime(currentDate.getTime() + 10001);

        const store = mockStore({
          services: Map({
              requests: Map()
                .setIn([self.configuration.id, ActionKeyStore.IS_FETCHING], false)
                .setIn([self.configuration.id, ActionKeyStore.RESULTS], self.expectedResults)
                .setIn([self.configuration.id, ActionKeyStore.EXPIRATION_DATE], expirationDate)
          }),
        });

        return store.dispatch(Actions.fetchIfNeeded(self.configuration, self.context))
             .then((response) => {
                 expect(self.mockService.fetch).not.toHaveBeenCalled();
                 expect(response).toBeUndefined(); // WARN: ConfigurationManager does not return results from the current state
             })
    });

    it('should fetch results if it has expired', () => {
        spyOn(self.mockService, 'fetch').and.callThrough();

        const currentDate    = new Date(),
              expirationDate = currentDate.setTime(currentDate.getTime() - 10000);

        const store = mockStore({
          services: Map({
              requests: Map()
                .setIn([self.configuration.id, ActionKeyStore.IS_FETCHING], false)
                .setIn([self.configuration.id, ActionKeyStore.RESULTS], self.expectedResults)
                .setIn([self.configuration.id, ActionKeyStore.EXPIRATION_DATE], expirationDate)
          }),
        });

        return store.dispatch(Actions.fetchIfNeeded(self.configuration, self.context))
             .then((response) => {
                 expect(self.mockService.fetch).toHaveBeenCalled();
                 expect(response).toEqual(self.expectedResults);
             })
    });
})


describe('ServiceManager Reducers', () => {

    beforeEach(() => {
        self.requestID = "example";
        self.expectedResults = [{
            id: 1,
            name: "Result1",
        },
        {
            id: 2,
            name: "Result2",
        }];
    })

    it('should return a fetching status', () => {
        const action = {
            type: ActionTypes.SERVICE_MANAGER_DID_START_REQUEST,
            requestID: self.requestID,
        };

        const expectedState = Map({
            requests: Map({
                example: Map({
                    isFetching: true,
                    error: null,
                })
            }),
        })

        expect(servicesReducer(undefined, action)).toEqual(expectedState)
    })

    it('should return the received response', () => {
        const action = {
            type: ActionTypes.SERVICE_MANAGER_DID_RECEIVE_RESPONSE,
            requestID: self.requestID,
            results: self.expectedResults,
            forceCache: true
        };

        const currentDate    = new Date(),
              expirationDate = currentDate.setTime(currentDate.getTime() + 86400000); // 24h

        const expectedState = Map({
            requests: Map({
                example: Map({
                    isFetching: false,
                    results: self.expectedResults,
                    expirationDate: expirationDate
                })
            }),
        })

        expect(servicesReducer(undefined, action)).toEqual(expectedState)
    })

    it('should return the received error', () => {
        const action = {
            type: ActionTypes.SERVICE_MANAGER_DID_RECEIVE_ERROR,
            requestID: self.requestID,
            error: {
                message: "Unknown error",
            }
        };

        const expectedState = Map({
            requests: Map({
                example: Map({
                    isFetching: false,
                    error: action.error, // WARN: ConfigurationManager uses fromJS
                    results: [], // WARN: ConfigurationManager uses fromJS
                })
            })
        })

        expect(servicesReducer(undefined, action)).toEqual(expectedState)
    })
});
