import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { Actions as DashboardActions, ActionKeyStore as DashboardActionKeyStore } from "../../services/dashboards/redux/actions";
import nock from 'nock';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Fetch Dashboard Configuration', () => {
    afterEach(() => {
        nock.cleanAll()
    })

    it('store `dashboards` when fetching dashboard from identifier', () => {
        const expectedActions = [
            { type: DashboardActions.DASHBOARD_DID_START_REQUEST },
            { type: DashboardActions.DASHBOARD_DID_RECEIVE_RESPONSE, data: expectedData }
        ];
        const expectedData = {
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

        const store = mockStore({ dashboards: {} });

        nock('/src/configs/nuage/dashboards')
            .get('/example.json')
            .reply(200, { body: expectedData });

        store.dispatch(DashboardActions.fetch('example'))
             .then(() => {
                 expect(store.getActions()).toEqual(expectedActions)
                 expect(store.getState().dashboards).toBe(expectedData);
             })
    })
})
