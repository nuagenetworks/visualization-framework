import React from "react";
import ReactDOM from "react-dom";
import { Provider as ReduxProvider } from "react-redux";

import "./index.css"
import App from "./App";
import injectTapEventPlugin from "react-tap-event-plugin";

import store from "./redux/store";

injectTapEventPlugin();

ReactDOM.render(
    <ReduxProvider store={store}>
        <App />
    </ReduxProvider>,
    document.getElementById("root")
);
