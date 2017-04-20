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

    componentDidMount() {
        const {
            configuration
        } = this.props;

        const {
            gaugePtrTransition,
            gaugeCtrFormat
        } = this.getConfiguredProperties();

        const format = d3.format(gaugeCtrFormat);
        const currentValue = this.currentValue;
        const minValue = this.minValue;

        d3.timeout(() => {
            d3.select(`#gauge-needle-${configuration.id}`)
                .transition()
                .ease(d3.easeLinear)
    			      .duration(gaugePtrTransition)
    			      .attr('transform', 'rotate(' + this.angle +')');

            d3.select(`#gauge-counter-${configuration.id}`)
                .transition()
                    .duration(gaugePtrTransition)
                    .on("start", function repeat() {
                        d3.active(this)
                            .tween("text", function() {
                                var that = d3.select(this),
                                i = d3.interpolateNumber(minValue, currentValue);
                                return function(t) { that.text(format(i(t) / 100)); };
                             });
                    });
        }, 500);
    }

    render() {
        const {
            data,
            width,
            height,
            configuration
        } = this.props;

        let cData = data;

        if (!data)
            return;

        if(data.length)
            cData = data[0];

        const {
            minValue,
            maxValue,
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
            gaugeCtrColor,
            gaugeCtrFontSize,
            labelFormat,
            fontColor,
            colors
        } = this.getConfiguredProperties();

        console.log('Data', this.getConfiguredProperties(), data);
        const angles = {
            min: -90,
            max: 90
        };

        let availableWidth     = width - (margin.left + margin.right);
        let availableHeight    = height - (margin.top + margin.bottom);


        const minRange         = cData[minColumn] ? cData[minColumn] : (minValue ? minValue : 0);
        const maxRange         = cData[maxColumn] ? cData[maxColumn] : (maxValue ? maxValue : 100);
        const currentValue     = cData[currentColumn] ? cData[currentColumn] : 20;

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
            .domain([minRange, maxRange]);

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

        this.angle        = angles.min + (scale(currentValue) * range);
        this.minValue     = minValue
        this.currentValue = currentValue;

        let needle = <path id={`gauge-needle-${configuration.id}`} d={ pointerLine(lineData) } fill={ gaugePtrColor } transform={ `rotate(${angles.min})` } />;

        let counterStyle = {
            fontSize: gaugeCtrFontSize
        };

        let counterText = <text id={`gauge-counter-${configuration.id}`} fill={ gaugeCtrColor } style={ counterStyle } transform={ `translate(0, ${height * (1 / 5)})` } > { minRange } </text>;

        return (
            <div className="gauge-graph">
                <svg width={ width } height={ height }>
                    <g transform={ `translate(${ width / 2 }, ${ height * (3 / 5) })` } >
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
                        {
                          needle
                        }

                        {
                          counterText
                        }
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
