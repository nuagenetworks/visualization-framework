import React from "react";

import AbstractGraph from "../AbstractGraph";

import * as d3 from "d3";

import "./style.css";

import {properties} from "./default.config"


export default class GaugeGraph extends AbstractGraph {

    constructor(props) {
        super(props, properties);
    }

    deg2rad(deg) {
        return deg * Math.PI / 180;
    }

    render() {
        const {
            data,
            width,
            height,
            onMarkClick
        } = this.props;

        if (!data || !data.length)
            return;

        const {
            chartWidthToPixel,
            minColumn,
            maxColumn,
            currentColumn,
            margin,
            gauzePtrWidth,
            gauzePtrTailLength,
            gauzePtrHeadLengthPercent,
            gauzePtrTransition,
            gauzeLabelInset,
            gauzeTicks,
            gauzeRingInset,
            gauzeRingWidth,
            stroke,
            fontColor
        } = this.getConfiguredProperties();

        const angles = {
            min: -90,
            max: 90
        };

        let availableWidth     = width - (margin.left + margin.right);
        let availableHeight    = height - (margin.top + margin.bottom);

        const minValue         = data[minColumn] ? data[minColumn] : 0;
        const maxValue         = data[maxColumn] ? data[maxColumn] : 100;
        const currentValue     = data[currentColumn] ? data[currentColumn] : 0;

        const minRadius   = Math.min(availableWidth, availableHeight) / 2;

        const innerRadius = minRadius - gauzeRingInset - gauzeRingWidth;
        const outerRadius = minRadius - gauzeRingInset - gauzeRingWidth;

        const range = angles.max - angles.min;

        const arc = d3.arc()
    			  .innerRadius(innerRadius)
    			  .outerRadius(outerRadius)
    			  .startAngle((d, i) => {
    				    return this.deg2rad(angles.min + (d * i * range));
    			  })
    			  .endAngle((d, i) => {
    				    return this.deg2rad(angles.max + (d * (i + 1) * range));
    			  });

        let scale = d3.scaleLinear()
    			  .range([0,1])
    			  .domain([minValue, maxValue]);

    		let ticks = scale.ticks(gauzeTicks);
        let tickData = d3.range(gauzeTicks).map(function() {return 1 / gauzeTicks;});
        console.log(ticks, tickData);
        /*const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        const labelArc = d3.arc()
            .innerRadius(labelRadius)
            .outerRadius(labelRadius);

        const pie    = d3.pie().value(value);
        const slices = pie(data);

        const labelText = (() => {
            if (percentages) {
                const percentageFormat = d3.format(percentagesFormat || ",.2%");
                const sum              = d3.sum(data, value);
                return (d) => percentageFormat(value(d) / sum);
            }
            return label;
        })();

        let strokeStyle = {
            strokeWidth: stroke.width,
            stroke: stroke.color
        }*/

        return (
            <div className="gauge-graph">
                <svg width={ width } height={ height }>
                    <g transform={ `translate(${ width / 2 }, ${ height / 2 })` } >

                    </g>
                </svg>
            </div>
        );
    }
}

GauzeGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.array
};
