import React, { Component } from "react";
import { ReduxRouter } from "redux-router";
import { Route } from "react-router";

import AppContainer from "./components/App/AppContainer.js";
import Dashboard from "./components/Dashboard";
import Visualization from "./components/Visualization";
import Testing from "./components/Testing";
import ReportDetails from "./components/Testing/ReportDetails.js";
import EditReports from "./components/Testing/EditReports.js";
class App extends Component {

    render() {
        return (
        <div>
            <AppContainer>
                <ReduxRouter>
                    <Route path={process.env.PUBLIC_URL +"/"} component={Dashboard} />
                    <Route path={process.env.PUBLIC_URL +"/dashboards/:id"} component={Dashboard} />
                    <Route path={process.env.PUBLIC_URL +"/reports/visualizations/:id"} component={Visualization} />
                    <Route path={process.env.PUBLIC_URL +"/testing"} component={Testing} />
                    <Route path={process.env.PUBLIC_URL +"/testing/reports/detail/:id"} component={ReportDetails} />
                    <Route path={process.env.PUBLIC_URL +"/testing/reports/edit/:id"} component={EditReports} />
                </ReduxRouter>
            </AppContainer>
        </div>
        );
    }
}

export default App;
