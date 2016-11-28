import React from "react";

import AbstractGraph from "../AbstractGraph";

import FontAwesome from "react-fontawesome";
import "./style.css";

import {properties} from "./default.config"

/*
    This graph will present the variation between 2 values:
     - Last value
     - Variation between previous value and last value
*/
export default class VariationTextGraph extends AbstractGraph {

    constructor(props) {
        super(props, properties);
    }

    currentTitle() {
        const {
            configuration,
        } = this.props;

        if (configuration && configuration.title)
            return configuration.title;

        return "Untitled";
    }

    renderTitleIfNeeded(requestedPosition, currentPosition) {
        if (requestedPosition !== currentPosition)
            return;

        return this.currentTitle();
    }

    computeValues(data, target) {
        if (!data || !target)
            return;

        let lastInfo,
            previousInfo;

        data.forEach((d) => {
            if (d[target.column] === target.value)
                lastInfo = d;
            else
                previousInfo = d;
        })

        const variation = lastInfo[target.field] - previousInfo[target.field];

        return {
            lastValue: lastInfo[target.field],
            previousValue: previousInfo[target.field],
            variation: variation !== 0 ? variation * 100 / previousInfo[target.field] : 0,
        }
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    decimals(x, nb = 2) {
        return x.toFixed(nb)
    }

    renderValues() {
        const {
            data,
        } = this.props;

        const {
            target,
            positiveColor,
            negativeColor,
            drawColor,
            fontSize
        } = this.getConfiguredProperties();

        const values = this.computeValues(data, target);

        if (!values)
            return;

        let variationColor = drawColor,
            variationIconName = "";

        if (values.variation > 0){
            variationColor = positiveColor;
            variationIconName = "caret-up";
        }

        if (values.variation < 0){
            variationColor = negativeColor;
            variationIconName = "caret-down";
        }

        return (
            <div>
                <div>
                    <span
                        style={{
                            fontSize: fontSize,
                            marginRight:"3px"
                        }}
                        >
                        {this.numberWithCommas(values.lastValue)}
                    </span>
                    <span
                        style={{
                            color: variationColor,
                            marginLeft: "3px"
                        }}
                        >

                        {this.decimals(values.variation)}%
                        <FontAwesome
                            name={variationIconName}
                            />
                    </span>
                </div>
            </div>
        )
    }

    render() {
        const {
            onMarkClick,
            data
        } = this.props;

        const {
          margin,
          textAlign,
          titlePosition
        } = this.getConfiguredProperties();

        if (!data || !data.length)
            return;

        const cursor = onMarkClick ? "pointer" : undefined

        return (

                <div
                    style={{
                        margin: [margin.top, margin.right, margin.bottom, margin.left].join(" "),
                        textAlign: textAlign,
                        cursor: cursor,
                        fontSize: "1.2em"
                    }}
                    onClick={onMarkClick}
                    >

                    {this.renderTitleIfNeeded(titlePosition, "top")}

                    {this.renderValues()}

                    {this.renderTitleIfNeeded(titlePosition, "bottom")}
                </div>
        );

    }
}

VariationTextGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.object
};
