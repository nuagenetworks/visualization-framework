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
        
        // Provide tooltips for subclasses.
        const { tooltip } = this.getConfiguredProperties();
        if(tooltip) {

            // Generate accessors that apply number and date formatters.
            const accessors = tooltip.map(columnAccessor);

            // This function is invoked to produce the content of a tooltip.
            this.getTooltipContent = () => {

                // The value of this.hoveredDatum should be set by subclasses
                // on mouseEnter and mouseMove of visual marks
                // to the data entry corresponding to the hovered mark.
                if(this.hoveredDatum) {
                    return (
                        <div>
                            {/* Display each tooltip column as "label : value". */}
                            {tooltip.map(({column, label}, i) => (
                                <div key={column}>
                                    <strong>
                                        {/* Use label if present, fall back to column name. */}
                                        {label || column}
                                    </strong> : <span>
                                        {/* Apply number and date formatting to the value. */}
                                        {accessors[i](this.hoveredDatum)}
                                    </span>
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
