import React from "react";

import { GraphManager } from "./index";


export default class AbstractGraph extends React.Component {

    constructor(props) {
        super(props);

        let properties;

        try {
            properties = require("./" + this.constructor.name + "/default.config.js").properties;
        }
        catch (err) {
            properties = {};
        }

        this.defaults = GraphManager.getDefaultProperties(properties);
    }

    // Gets the object containing all configured properties.
    // Uses properties from the configuration,
    // falling back to defaults for unspecified properties.
    getConfiguredProperties() {
        return Object.assign({}, this.defaults, this.props.configuration.data);
    }
}
