import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { Actions, ActionKeyStore, ActionTypes } from "./redux/actions";
import { ConfigurationService } from "./index"
import configurationsReducer from "./redux/reducer";

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('ConfigurationService fetch dashboard', () => {

    it('should dispatch didStartRequest and didReceiveResponse actions when succesfully load dashboard', () => {
        const expectedDashboard = {
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

        ConfigurationService.fetch = jasmine.createSpy("fetch").and.callFake(() => {
            return Promise.resolve(expectedDashboard);
        });

        const store = mockStore({ dashboards: {} });

        return store.dispatch(Actions.fetch('example', ActionKeyStore.DASHBOARDS))
             .then((response) => {
                 let actions = store.getActions();
                 expect(actions.length).toEqual(2)
                 expect(actions[0]).toEqual({
                     type: ActionTypes.CONFIG_DID_START_REQUEST,
                     id: 'example',
                     configType: ActionKeyStore.DASHBOARDS,
                 })
                 expect(actions[1]).toEqual({
                     type: ActionTypes.CONFIG_DID_RECEIVE_RESPONSE,
                     id: 'example',
                     configType: ActionKeyStore.DASHBOARDS,
                     data: expectedDashboard,
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

        const store = mockStore({ dashboards: {} });

        return store.dispatch(Actions.fetch('example', ActionKeyStore.DASHBOARDS))
             .then((response) => {
                 let actions = store.getActions();
                 expect(actions.length).toEqual(2)
                 expect(actions[0]).toEqual({
                     type: ActionTypes.CONFIG_DID_START_REQUEST,
                     id: 'example',
                     configType: ActionKeyStore.DASHBOARDS,
                 })
                 expect(actions[1]).toEqual({
                     type: ActionTypes.CONFIG_DID_RECEIVE_ERROR,
                     id: 'example',
                     configType: ActionKeyStore.DASHBOARDS,
                     error: expectedError.message,
                 })
             })
    });
})
