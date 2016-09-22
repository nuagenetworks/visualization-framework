import React from "react";
import { render } from "react-dom";
import { shallow } from 'enzyme';
import TestUtils from "react-addons-test-utils";

import { DashboardView } from "./index";


describe('Dashboard Component', () => {

    it('renders without crashing', () => {
        let params = {
                id: "dashboard1"
            },
            setPageTitle = ((title) => {}),
            fetchDashboardConfiguration = ((id) => {});

      shallow(<DashboardView
                params={params}
                setPageTitle={setPageTitle}
                fetchDashboardConfiguration={fetchDashboardConfiguration}
                />);
    });
});
