import React from "react";
import ReactDOM from "react-dom";
import { Provider as ReduxProvider } from "react-redux";
import { ConnectedRouter } from 'connected-react-router'

import store, { history } from "./redux/store";

import App from "./App";

import "./index.css";

ReactDOM.render(
    <ReduxProvider store={store}>
        <ConnectedRouter history={history}>
            <App />
        </ConnectedRouter>
    </ReduxProvider>,
    document.getElementById("root")
);
