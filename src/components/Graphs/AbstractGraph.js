import React from "react";
import ReactTooltip from "react-tooltip";

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
                            {tooltip.map(({column, label}, i) => (
                                <div key={column}>
                                    <strong>{label || column}</strong> : {accessors[i](d)}
                                </div>
                            ))}
                        </div>
                    );
                } else {
                    return null;
                }
            }
            // Use a unique tooltip ID per visualization,
            // otherwise there are overlapping tooltips.
            this.tooltipId = Math.random();

            // This JSX object can be used by subclasses to enable tooltips.
            this.tooltip = (
                <ReactTooltip
                    id={ this.tooltipId }
                    place="top"
                    type="dark"
                    effect="float"
                    getContent={this.getTooltipContent.bind(this)}
                />
            );

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
