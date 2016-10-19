import React from "react";

import { properties } from "./BarGraph.config.js";
import { getDefaultProperties } from "../../utils/properties.js";


export default class AbstractGraph extends React.Component {

    constructor(props) {
        super(props);
        this.defaults = getDefaultProperties(properties);
    }

    // Gets the object containing all configured properties.
    // Uses properties from the configuration,
    // falling back to defaults for unspecified properties.
    getConfiguredProperties() {
        return Object.assign({}, this.defaults, this.props.configuration.data);
    }
}
