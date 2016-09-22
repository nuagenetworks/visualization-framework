import React, { Component } from "react";
import { ReduxRouter } from "redux-router";
import { Route } from "react-router";

import AppContainer from "./components/App/AppContainer.js";
import Dashboard from "./components/Dashboard"

// Examples
import DomainContainer from "./components/Examples/DomainContainer.js";
import EnterpriseContainer from "./components/Examples/EnterpriseContainer.js";
import Page2Container from "./components/Examples/Page2Container.js";
import PageContainer from "./components/Examples/PageContainer.js";


class App extends Component {

    render() {
        return (
        <div>
            <AppContainer>
                <ReduxRouter>
                    <Route path="/" component={PageContainer} />
                    <Route path="/dashboards/:id*" component={Dashboard} />
                    <Route path="/zoom" component={Page2Container} />
                    <Route path="/enterprises/:enterpriseID" component={EnterpriseContainer} />
                    <Route path="/domains/:domainID" component={DomainContainer} />
                </ReduxRouter>
            </AppContainer>
        </div>
        );
    }
}

export default App;
