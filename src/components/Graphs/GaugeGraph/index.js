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
            height
        } = this.props;

        if (!data || !data.length)
            return;

        const {
            minColumn,
            maxColumn,
            currentColumn,
            margin,
            gaugePtrWidth,
            gaugePtrTailLength,
            gaugePtrHeadLengthPercent,
            gaugeLabelInset,
            gaugePtrColor,
            gaugeTicks,
            gaugeRingInset,
            gaugeRingWidth,
            labelFormat,
            fontColor,
            colors
        } = this.getConfiguredProperties();

        const angles = {
            min: -90,
            max: 90
        };

        let availableWidth     = width - (margin.left + margin.right);
        let availableHeight    = height - (margin.top + margin.bottom);

        const minValue         = data[minColumn] ? data[minColumn] : 0;
        const maxValue         = data[maxColumn] ? data[maxColumn] : 100;
        const currentValue     = data[currentColumn] ? data[currentColumn] : 20;

        const minRadius   = Math.min(availableWidth, availableHeight) / 2;

        const innerRadius = minRadius - gaugeRingInset - gaugeRingWidth;
        const outerRadius = minRadius - gaugeRingInset;

        const pointerHeadLength = Math.round(minRadius * gaugePtrHeadLengthPercent);

        const arcColor = d3.interpolateHsl(d3.rgb(colors[0] ? colors[0] : '#e8e2ca'), d3.rgb(colors[1] ? colors[1] : '#3e6c0a'))

        const range = angles.max - angles.min;

        const arc = d3.arc()
    			  .innerRadius(innerRadius)
    			  .outerRadius(outerRadius)
    			  .startAngle((d, i) => {
    				    return this.deg2rad(angles.min + (d * i * range));
    			  })
    			  .endAngle((d, i) => {
    				    return this.deg2rad(angles.min + (d * (i + 1) * range));
    			  });

        let scale = d3.scaleLinear()
    			  .range([0,1])
    			  .domain([minValue, maxValue]);

    		let ticks = scale.ticks(gaugeTicks);
        let tickData = d3.range(gaugeTicks).map(function() {return 1 / gaugeTicks;});

        const textLabel = ((d) => {
            const formatter = d3.format(labelFormat || ",.2s");
            return formatter(d);
        });

        const transformText = ((d, i) => {
            return `rotate(${angles.min + (scale(d) * range)}) translate(0, ${gaugeLabelInset - minRadius})`;
        });

        const lineData = [ [gaugePtrWidth / 2, 0],
    						[0, -pointerHeadLength],
    						[-(gaugePtrWidth / 2), 0],
    						[0, gaugePtrTailLength],
    						[gaugePtrWidth / 2, 0] ];

        const pointerLine = d3.line()
            .curve(d3.curveMonotoneX);

        return (
            <div className="gauge-graph">
                <svg width={ width } height={ height }>
                    <g transform={ `translate(${ width / 2 }, ${ (height * 2) / 3 })` } >
                        {
                            tickData.map((tick, i) => {
                                return <g key={i} >
                                    <path
                                      d={ arc(tick, i) }
                                      fill={ arcColor(tick * i) }
                                    />
                                </g>
                            })
                        }
                        {
                            ticks.map((tick, i) => {
                                return <g key={i} >
                                    <text transform={ transformText(tick, i) } fill={ fontColor }>
                                        {textLabel(tick)}
                                    </text>
                                </g>
                            })
                        }
                        <path d={ pointerLine(lineData) } fill={ gaugePtrColor } transform={ `rotate(${angles.min + (scale(currentValue) * range)})` } />
                    </g>
                </svg>
            </div>
        );
    }
}

GaugeGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.array
};
