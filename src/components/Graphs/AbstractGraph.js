import React from "react";
import { scaleOrdinal } from "d3";

import { GraphManager } from "./index";



export default class AbstractGraph extends React.Component {

    constructor(props) {
        super(props);

        let properties;

        try {
            // TODO: Make sure the name is not going to change in the build
            properties = require("./" + this.constructor.name + "/default.config.js").properties;
        }
        catch (err) {
            properties = {};
        }

        this.defaults = GraphManager.getDefaultProperties(properties);
        this.scale = null;
    }

    getConfiguredProperties() {
        return Object.assign({}, this.defaults, this.props.configuration.data);
    }

    scaleColor(data) {
        const { colors } = this.getConfiguredProperties();

        const scale = scaleOrdinal(colors);
        scale.domain(data.map((d, i) => i));

        return scale;
    }
}
