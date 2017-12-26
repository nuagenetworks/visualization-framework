import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { Actions, ActionKeyStore, ActionTypes } from "./redux/actions";
import { ConfigurationService } from "./index"
import configurationsReducer from "./redux/reducer";
import { fromJS, Map } from "immutable";

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('Configuration Service: fetch configuration', () => {

    beforeEach(function() {
        self.expectedConfiguration = {
            "id": "example",
            "author": "Christophe SERAFIN",
            "creationDate": "09/15/2016",
            "title": "An example",
            "data": {
                "layout": [
                    { "title": "Graph 1", "i": "graph1", "x": 0, "y": 0, "w": 6, "h": 22, "minW": 6, "minH": 22 },
                    { "title": "Graph 2", "i": "graph2", "x": 6, "y": 0, "w": 6, "h": 22, "minW": 6, "minH": 22 },
                    { "title": "Graph 3", "i": "graph3", "x": 0, "y": 22, "w": 2, "h": 16, "minW": 2, "minH": 16 },
                    { "title": "Graph 4", "i": "graph4", "x": 2, "y": 22, "w": 4, "h": 16, "minW": 4, "minH": 16 }
                ]
            }
        };
        self.configurationID = 'example';
        self.configurationType = ActionKeyStore.DASHBOARDS;

        self.store = mockStore({ dashboards: {} });
    });

    it('should dispatch didStartRequest and didReceiveResponse actions when succesfully load dashboard', () => {

        ConfigurationService.fetch = jasmine.createSpy("fetch").and.callFake(() => {
            return Promise.resolve(expectedConfiguration);
        });

        return self.store.dispatch(Actions.fetch(self.configurationID, self.configurationType))
             .then((response) => {
                 let actions = self.store.getActions();

                 expect(actions.length).toEqual(2)
                 expect(actions[0]).toEqual({
                     type: ActionTypes.CONFIG_DID_START_REQUEST,
                     id: self.configurationID,
                     configType: self.configurationType,
                 })
                 expect(actions[1]).toEqual({
                     type: ActionTypes.CONFIG_DID_RECEIVE_RESPONSE,
                     id: self.configurationID,
                     configType: self.configurationType,
                     data: expectedConfiguration,
                 })
             })
    });

    it('should dispatch didStartRequest and didReceiveError when error occurs', () => {
        const expectedError = {
            "status": "401",
            "message": "Unknown error",
        };

        ConfigurationService.fetch = jasmine.createSpy("fetch").and.callFake(() => {
            return Promise.reject(expectedError);
        });

        return self.store.dispatch(Actions.fetch(self.configurationID, self.configurationType))
             .then((response) => {
                 let actions = self.store.getActions();

                 expect(actions.length).toEqual(2)
                 expect(actions[0]).toEqual({
                     type: ActionTypes.CONFIG_DID_START_REQUEST,
                     id: self.configurationID,
                     configType: self.configurationType,
                 })
                 expect(actions[1]).toEqual({
                     type: ActionTypes.CONFIG_DID_RECEIVE_ERROR,
                     id: self.configurationID,
                     configType: self.configurationType,
                     error: expectedError.message,
                 })
             })
    });
})


describe('Configuration Actions: fetchIfNeeded', () => {

    beforeEach(() => {
        self.expectedConfiguration = {
            "id": "example",
            "author": "Christophe SERAFIN",
            "creationDate": "09/15/2016",
            "title": "An example",
            "data": {
                "layout": [
                    { "title": "Graph 1", "i": "graph1", "x": 0, "y": 0, "w": 6, "h": 22, "minW": 6, "minH": 22 },
                    { "title": "Graph 2", "i": "graph2", "x": 6, "y": 0, "w": 6, "h": 22, "minW": 6, "minH": 22 },
                    { "title": "Graph 3", "i": "graph3", "x": 0, "y": 22, "w": 2, "h": 16, "minW": 2, "minH": 16 },
                    { "title": "Graph 4", "i": "graph4", "x": 2, "y": 22, "w": 4, "h": 16, "minW": 4, "minH": 16 }
                ]
            }
        };
        self.configurationID = 'example';
        self.configurationType = ActionKeyStore.DASHBOARDS;
    });

    it('should fetch if no dashboard has been previsouly fetched', () => {
        const store = mockStore({
            dashboards: Map(),
            configurations: Map(),
        });

        ConfigurationService.fetch = jasmine.createSpy("fetch").and.callFake(() => {
            return Promise.resolve(self.expectedConfiguration);
        });

        return store.dispatch(Actions.fetchIfNeeded(self.configurationID, self.configurationType))
             .then((response) => {
                 expect(ConfigurationService.fetch).toHaveBeenCalledWith(self.configurationID, self.configurationType);
                 expect(response).toEqual(self.expectedConfiguration);
             })
    });

    it('should not fetch dashboard if one is currently fetching', () => {
        ConfigurationService.fetch = jasmine.createSpy("fetch");

        const store = mockStore({
            dashboards: Map(),
            configurations: Map().setIn([self.configurationType, self.configurationID, ActionKeyStore.IS_FETCHING], true),
        });

        return store.dispatch(Actions.fetchIfNeeded(self.configurationID, self.configurationType))
             .then((response) => {
                 expect(ConfigurationService.fetch).not.toHaveBeenCalled();
                 expect(response).toBeUndefined();
             })
    });

    it('should not fetch dashboard if one has been fetched', () => {
        ConfigurationService.fetch = jasmine.createSpy("fetch");

        const currentDate    = Date.now(),
              expirationDate = currentDate + 10000;

        const store = mockStore({
            dashboards: Map(),
            configurations: Map()
                .setIn([self.configurationType, self.configurationID, ActionKeyStore.IS_FETCHING], false)
                .setIn([self.configurationType, self.configurationID, ActionKeyStore.DATA], self.expectedConfiguration)
                .setIn([self.configurationType, self.configurationID, ActionKeyStore.EXPIRATION_DATE], expirationDate)
        });

        return store.dispatch(Actions.fetchIfNeeded(self.configurationID, self.configurationType))
             .then((response) => {
                 expect(ConfigurationService.fetch).not.toHaveBeenCalled();
                 expect(response).toBeUndefined();
             })
    });

    it('should fetch dashboard if one has expired', () => {
        ConfigurationService.fetch = jasmine.createSpy("fetch");

        const currentDate    = Date.now(),
              expirationDate = currentDate - 10000;

        const store = mockStore({
            dashboards: Map(),
            configurations: Map()
                .setIn([self.configurationType, self.configurationID, ActionKeyStore.IS_FETCHING], false)
                .setIn([self.configurationType, self.configurationID, ActionKeyStore.DATA], fromJS(self.expectedConfiguration))
                .setIn([self.configurationType, self.configurationID, ActionKeyStore.EXPIRATION_DATE], expirationDate)
        });

        ConfigurationService.fetch = jasmine.createSpy("fetch").and.callFake(() => {
            return Promise.resolve(self.expectedConfiguration);
        });

        return store.dispatch(Actions.fetchIfNeeded(self.configurationID, self.configurationType))
             .then((response) => {
                 expect(ConfigurationService.fetch).toHaveBeenCalledWith(self.configurationID, self.configurationType);
                 expect(response).toEqual(self.expectedConfiguration);
             })
    });
})


describe('Configuration Reducers: fetchIfNeeded', () => {

    beforeEach(() => {
        self.expectedConfiguration = {
            "id": "example",
            "author": "Christophe SERAFIN",
            "creationDate": "09/15/2016",
            "title": "An example",
            "data": {
                "layout": [
                    { "title": "Graph 1", "i": "graph1", "x": 0, "y": 0, "w": 6, "h": 22, "minW": 6, "minH": 22 },
                    { "title": "Graph 2", "i": "graph2", "x": 6, "y": 0, "w": 6, "h": 22, "minW": 6, "minH": 22 },
                    { "title": "Graph 3", "i": "graph3", "x": 0, "y": 22, "w": 2, "h": 16, "minW": 2, "minH": 16 },
                    { "title": "Graph 4", "i": "graph4", "x": 2, "y": 22, "w": 4, "h": 16, "minW": 4, "minH": 16 }
                ]
            }
        };
        self.configurationID = 'example',
        self.configurationType = ActionKeyStore.DASHBOARDS;
    });

    it('should return a fetching status', () => {
        const action = {
            type: ActionTypes.CONFIG_DID_START_REQUEST,
            id: self.configurationID,
            configType: self.configurationType,
            data: self.expectedConfiguration
        };

        const expectedState = Map({
            dashboards: Map({
                example: Map({
                    isFetching: true,
                })
            }),
            visualizations: Map(),
            queries: Map(),
        })

        expect(configurationsReducer(undefined, action)).toEqual(expectedState)
    })

    it('should return the received response', () => {
        const action = {
            type: ActionTypes.CONFIG_DID_RECEIVE_RESPONSE,
            id: self.configurationID,
            configType: self.configurationType,
            data: self.expectedConfiguration
        };

        const expectedState = Map({
            dashboards: Map({
                example: Map({
                    isFetching: false,
                    data: fromJS(self.expectedConfiguration)
                })
            }),
            visualizations: Map(),
            queries: Map(),
        })

        const fullState = configurationsReducer(undefined, action);
        const expirationDate = fullState.getIn(["dashboards", "example", "expirationDate"]);
        const state = fullState.deleteIn(["dashboards", "example", "expirationDate"]);

        expect(state).toEqual(expectedState);
    })

    it('should return the received error', () => {
        const action = {
            type: ActionTypes.CONFIG_DID_RECEIVE_ERROR,
            id: self.configurationID,
            configType: self.configurationType,
            error: {
                message: "Unknown error",
            }
        };

        const expectedState = Map({
            dashboards: Map({
                example: Map({
                    isFetching: false,
                    data: fromJS([]),
                    error: fromJS(action.error),
                })
            }),
            visualizations: Map(),
            queries: Map(),
        })

        expect(configurationsReducer(undefined, action)).toEqual(expectedState)
    })
});
