import React from "react";
import ReactDOM from "react-dom";
import { Provider as ReduxProvider } from "react-redux";

import "./index.css"
import App from "./App";
import store from "./redux/store";
import { Actions as ElasticsearchActions } from "./utils/redux/actions";
import injectTapEventPlugin from "react-tap-event-plugin";

injectTapEventPlugin();

ReactDOM.render(
    <ReduxProvider store={store}>
        <App />
    </ReduxProvider>,
    document.getElementById("root")
);

// Dispatch our thunk action creator that will
// kick off the initial ElasticSearch query.
store.dispatch(ElasticsearchActions.fetch());
