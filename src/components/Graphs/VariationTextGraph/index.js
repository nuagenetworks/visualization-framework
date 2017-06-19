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
            variation: variation !== 0 ? variation * 100 / previousInfo[target.field] : 0
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
            absolute,
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

        let info = null;

        if (!absolute) {
            info = <div>
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

                    {absolute ? values.absolute : `${this.decimals(values.variation)}%`}

                    <FontAwesome
                        name={variationIconName}
                      />
                </span>
            </div>
        } else {
          info = <div>
                <span
                    style={{
                        fontSize: fontSize,
                        marginRight:"3px",
                        color: variationColor
                    }}
                    >
                    {this.numberWithCommas(values.lastValue)} / {this.numberWithCommas(values.previousValue)}
                </span>
            </div>
        }
        console.log('absolute', absolute, values);
        return (
            <div>
                {info}
            </div>
        )
    }

    render() {
        const {
            onMarkClick,
            data
        } = this.props;

        const {
          padding,
          textAlign,
          titlePosition
        } = this.getConfiguredProperties();

        if (!data || !data.length)
            return;

        const cursor = onMarkClick ? "pointer" : undefined
        return (

                <div
                    style={{
                        padding: [padding.top, padding.right, padding.bottom, padding.left].join(" "),
                        textAlign: textAlign,
                        cursor: cursor,
                        fontSize: "1.2em"
                    }}
                    onClick={onMarkClick}
                    >
                    {this.renderValues()}
                </div>
        );

    }
}

VariationTextGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.array
};
