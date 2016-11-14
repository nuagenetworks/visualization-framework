import React from "react";

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
    }

    getConfiguredProperties() {
        return Object.assign({}, this.defaults, this.props.configuration.data);
    }

    applyColor(index) {
        const { colors } = this.getConfiguredProperties();
        return colors[index % colors.length];
    }

    getTooltipContent() {
        const { tooltip } = this.getConfiguredProperties();
        const d = this.hoveredDatum;
        if(tooltip && d) {
            return (
                <div>
                    {tooltip.map(({column}) => (
                        <div key={column}>
                            <strong>{column}</strong> : {d[column]}
                        </div>
                    ))}
                </div>
            );
        } else {
            return null;
        }
    }

}
