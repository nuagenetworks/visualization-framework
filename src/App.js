import React, { Component } from "react";
import { ReduxRouter } from "redux-router";
import { Route } from "react-router";

import AppContainer from "./components/App/AppContainer.js";
import Dashboard from "./components/Dashboard"
import Visualization from "./components/Visualization"


class App extends Component {

    render() {
        return (
        <div>
            <AppContainer>
                <ReduxRouter>
                    <Route path="/" component={Dashboard} />
                    <Route path="/dashboards/:id" component={Dashboard} />
                    <Route path="/visualizations/:id" component={Visualization} />
                </ReduxRouter>
            </AppContainer>
        </div>
        );
    }
}

export default App;
