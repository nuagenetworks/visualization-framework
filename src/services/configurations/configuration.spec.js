import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { Actions, ActionKeyStore, ActionTypes } from "./redux/actions";
import nock from 'nock';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Fetch Dashboard Configuration', () => {
    afterEach(() => {
        nock.cleanAll()
    })

    xit('store `dashboards` when fetching dashboard from identifier', () => {
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

        nock('/src/configs/nuage/dashboards')
            .get('/example.json')
            .reply(200, { body: expectedDashboard });

        const store = mockStore({ dashboards: {} });

        const expectedActions = [
            { type: ActionTypes.CONFIG_DID_START_REQUEST },
            { type: ActionTypes.CONFIG_DID_RECEIVE_RESPONSE, data: expectedDashboard }
        ];

        store.dispatch(Actions.fetch('example', ActionKeyStore.DASHBOARDS))
             .then(() => {
                 console.error(store.getActions());
                 console.error(expectedActions);
                 console.error(0);
                 expect(store.getActions()).toEqual(expectedActions)
                 console.error(1);
                 expect(store.getState().dashboards).toBe(expectedDashboard);
                 console.error(2);
             })
    });

    xit('store `visualization` and `query` when fetching dashboard from identifier', () => {
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
            },
            "visualizations": ["visualization1", "visualization2"]
        };

        nock('/src/configs/nuage/dashboards')
            .get('/example.json')
            .reply(200, { body: expectedDashboard });

        const expectedVisualization1 = {
            "id": "visualization1",
            "author": "Christophe SERAFIN",
            "creationDate": "09/15/2016",
            "title": "Visualization 1",
            "data": {},
            "query": "query1"
        };

        nock('/src/configs/nuage/visualizations')
            .get('/visualization1.json')
            .reply(200, { body: expectedVisualization1 });

        const expectedQuery1 = {
            "id": "query1",
            "params": {},
        };

        nock('/src/configs/nuage/queries')
            .get('/query1.json')
            .reply(200, { body: expectedQuery1 });

        const expectedVisualization2 = {
            "id": "visualization2",
            "author": "Christophe SERAFIN",
            "creationDate": "09/15/2016",
            "title": "Visualization 2",
            "data": {},
            "query": "query2"
        };

        nock('/src/configs/nuage/visualizations')
            .get('/visualization2.json')
            .reply(200, { body: expectedVisualization2 });

        const expectedQuery2 = {
            "id": "query2",
            "params": {},
        };

        nock('/src/configs/nuage/queries')
            .get('/query2.json')
            .reply(200, { body: expectedQuery2 });

        const store = mockStore({ dashboards: {}, queries: {}, visualizations: {} });

        const expectedActions = [
            { type: Actions.CONFIG_DID_START_REQUEST },
            { type: Actions.CONFIG_DID_START_REQUEST },
            { type: Actions.CONFIG_DID_START_REQUEST },
            { type: Actions.CONFIG_DID_RECEIVE_RESPONSE, data: expectedQuery1 },
            { type: Actions.CONFIG_DID_RECEIVE_RESPONSE, data: expectedVisualization1 },
            { type: Actions.CONFIG_DID_START_REQUEST },
            { type: Actions.CONFIG_DID_START_REQUEST },
            { type: Actions.CONFIG_DID_RECEIVE_RESPONSE, data: expectedQuery2 },
            { type: Actions.CONFIG_DID_RECEIVE_RESPONSE, data: expectedVisualization2 },
            { type: Actions.CONFIG_DID_RECEIVE_RESPONSE, data: expectedDashboard }
        ];

        store.dispatch(Actions.fetch('example'))
             .then(() => {
                 console.error(store.getActions());
                 console.error(expectedActions);

                 expect(store.getActions()).toEqual(expectedActions)
                 expect(store.getState().dashboards).toBe(expectedDashboard);
                 expect(store.getState().visualizations).toBe({
                    visualization1: expectedVisualization1,
                    visualization2: expectedVisualization2,
                });
                expect(store.getState().queries).toBe({
                   query1: expectedQuery1,
                   query2: expectedQuery2,
               });
             })
    });


})
