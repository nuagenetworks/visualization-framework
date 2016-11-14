import React from "react";

import { GraphManager } from "./index";
import columnAccessor from "../../utils/columnAccessor";

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
        
        const { tooltip } = this.getConfiguredProperties();
        if(tooltip) {
            const accessors = tooltip.map(columnAccessor);
            this.getTooltipContent = () => {
                const d = this.hoveredDatum;
                if(d) {
                    return (
                        <div>
                            {tooltip.map(({column}, i) => (
                                <div key={column}>
                                    <strong>{column}</strong> : {accessors[i](d)}
                                </div>
                            ))}
                        </div>
                    );
                } else {
                    return null;
                }
            }
        } else {
            this.getTooltipContent = () => null
        }

    }

    getConfiguredProperties() {
        return Object.assign({}, this.defaults, this.props.configuration.data);
    }

    applyColor(index) {
        const { colors } = this.getConfiguredProperties();
        return colors[index % colors.length];
    }

}
