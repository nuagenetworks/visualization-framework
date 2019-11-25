import React, { Component } from "react";
import { Route, BrowserRouter, Switch } from "react-router-dom";

import AppContainer from "./components/App/AppContainer.js";
import Dashboard from "./components/Dashboard"
import Visualization from "./components/Visualization";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { VFS } from "./features";


class App extends Component {

    render() {
        return (
            <MuiThemeProvider>
                <AppContainer>
                    <Route exact path={`${process.env.PUBLIC_URL}/`} component={Dashboard} />
                    <Route path={`${process.env.PUBLIC_URL}/dashboards/:id`} component={Dashboard} />
                    <Route path={`${process.env.PUBLIC_URL}/visualizations/:id`} component={Visualization} />
                    <Route path={`${process.env.PUBLIC_URL}/vfs/new`} component={VFS}  />
                </AppContainer>
            </MuiThemeProvider>
        )
    }
}

export default App;
