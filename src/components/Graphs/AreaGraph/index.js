import React from "react";
import XYGraph from "../XYGraph";
import { connect } from "react-redux";
import * as d3 from "d3";

import {
    line,
    select,
    brushX,
    area
} from "d3";

import {properties} from "./default.config";

class AreaGraph extends XYGraph {

    constructor(props) {
        super(props, properties);
        this.brush = brushX(); 
    }

    componentWillMount() {
        this.initiate(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if(this.props !== nextProps) {
            this.initiate(nextProps);
        }
    }

    initiate(props) {
        const {
            data,
        } = props;

        if (!data || !data.length)
            return;

        this.parseData();
        this.setDimensions(props);
        this.updateLegend();
        this.generateXYGraph(props);
        this.generateElements();
    }

    parseData() {
        const {
            data
        } = this.props;

        const {
          linesColumn,
          yColumn
        } = this.getConfiguredProperties();

        this.legendsData = [];
        let updatedLinesLabel = [];
        let finalYColumn      = typeof yColumn === 'object' ? yColumn : [yColumn];

        if(linesColumn) 
            updatedLinesLabel = typeof linesColumn === 'object' ? linesColumn : [linesColumn];

        this.legendsData = finalYColumn.map((d, i) => {
            return {
                'key'   : d,
                'value' : updatedLinesLabel[i] ? updatedLinesLabel[i] : d
            };
        });

        this.filterDatas = [];

        data.forEach((d) => {
            this.getLegendsData().forEach((ld) => {
              if(d[ld['key']] !== null) {
                this.filterDatas.push(Object.assign({
                    yColumn: d[ld['key']] !== null ? d[ld['key']] : 0,
                    columnType: ld['key']
                }, d));
              }
            });
        });
    }

    getFilterDatas() {
        return this.filterDatas;
    }

    setDimensions(props) {
        this.setYlabelWidth(this.getFilterDatas());
        this.setAvailableWidth(props);
        this.setAvailableHeight(props);
        this.setLeftMargin();
        this.setXBandScale(this.props.data);
        this.setYBandScale(this.props.data)
    }

    updateLegend() {

        const {
          chartHeightToPixel,
          chartWidthToPixel,
          circleToPixel,
          legend,
        } = this.getConfiguredProperties();

        const legendFn   = (d) => d['value'];
        let legendWidth  = legend.show && this.getLegendsData().length >= 1 ? this.longestLabelLength(this.getLegendsData(), legendFn) * chartWidthToPixel : 0;

        if (legend.show)
        {
            legend.width = legendWidth;

            // Compute the available space considering a legend
            if (this.checkIsVerticalLegend())
            {
                this.leftMargin      +=  legend.width;
                this.availableWidth  -=  legend.width;
            }
            else {
                const nbElementsPerLine  = parseInt(this.getAvailableWidth() / legend.width, 10);
                const nbLines            = parseInt(this.getLegendsData().length / nbElementsPerLine, 10);
                this.availableHeight         -= nbLines * legend.circleSize * circleToPixel + chartHeightToPixel;
            }
        }

        this.legend = legend;
    }

    getLegend() {
        return this.legend;
    }

    getLegendsData() {
        return this.legendsData;
    }

    generateXYGraph(props) {

        const {
            data,
        } = props;

        this.setXScale(data);
        this.setXaxis(data);
        this.setYScale(this.getFilterDatas());
        this.setYaxis();
        this.setXTitlePositions();
        this.setYTitlePositions();
    }

    generateElements() {

        this.areas        = [];
        this.lines        = [];
        this.circle       = [];
        this.hoverCircle  = [];

        this.getLegendsData().map((d, i) =>
            this.generateElement(this.getFilterDatas(), d, this.props.data.length === 1 ? true: false)    
        )
    }

    generateElement(filterData, data, isCircle = false) {

        const {
           circleRadius,
           colors,
           xColumn,
           stroke               
        } = this.getConfiguredProperties();

        const scale = this.scaleColor(this.getLegendsData(), 'key');

        this.getColor  = (d) => scale ? scale(d['key']) : stroke.color || colors[0];

        if(isCircle) {
          this.circle = filterData.map( (d) =>
                <circle cx={this.getXScale()(d.xColumn)} cy={d[data['key']]} r={circleRadius} fill={ scale ? scale(d['columnType']) : colors[0]} />
            )
            return;
        }

        let xScale = this.getXScale();
        let yScale = this.getYScale();
        let availableHeight = this.getAvailableHeight();

        this.hoverCircle.push(
            <circle key={`${data['key']}`} id={`circle_${data['key']}`} cx={1} cy={1} r={circleRadius} fill={ scale ? scale(data['key']) : colors[0]} />
        )

        var lineGenerator = line()
            .x(function(d) { return xScale(d[xColumn]); })
            .y(function(d) { return yScale(d[data['key']]); });

        var areaGenerator = area()
            .x(function(d, i) { return xScale(d[xColumn]); })
            .y0(function(d) { return availableHeight; })
            .y1(function(d) { return yScale(d[data['key']]); })


        this.areas.push( <path
                key={ `${data['key']}` }
                fill={ this.getColor(data) }
                opacity={ stroke.opacity }
                d={ areaGenerator(filterData) }
            />
        )

        this.lines.push( <path
                  key={ data['key'] }
                  fill="none"
                  stroke={ this.getColor(data) }
                  strokeWidth={ stroke.width }
                  d={ lineGenerator(filterData) }
              />    
        )
    }

    getLines() {
        return this.lines ? this.lines : [];
    }

    getAreas() {
        return this.areas ? this.areas : [];
    }

    getCircle() {
        return this.circle ? this.circle : [];
    }

    getHoverCircle() {
        return this.hoverCircle ? this.hoverCircle : [];
    }

    handleShowEvent() {
        d3.select("#tooltip-line").style("opacity", 1);
    }

    handleHideEvent() {
        this.hoveredDatum = null;
        d3.select("#tooltip-line").style("opacity", 0);
    }

    renderTooltip() {
        const {
          xColumn,
        } = this.getConfiguredProperties();

        let xScale = this.getXScale();
        let bandwidth = this.getXBandScale().bandwidth() * 0.8;

        return this.getFilterDatas().map((d, i) =>
           <g
              key={ i }
              { ...this.tooltipProps(d) }
              data-effect="solid"
              onMouseOver={() => this.updateVerticalLine(d)}

            >
              <rect
                  x={xScale(d[xColumn]) - (bandwidth)/2}
                  y="0"
                  width={bandwidth}
                  height={this.getAvailableHeight()}
                  fill="red"
                  opacity="0"
              />

          </g>


      )
    }

    updateVerticalLine(data) {
        const {
          xColumn,
        } = this.getConfiguredProperties();

        const yScale = this.getYScale();
        const rightMargin = this.hoveredDatum ? this.getXScale()(data[xColumn])  : 0;

        d3.select("#tooltip-line").attr("transform", "translate("+rightMargin+", 0)");

        this.getLegendsData().forEach(function(d) {
            d3.select(`#circle_${d['key']}`)
                .attr("cy", yScale(data[d['key']]));
        }); 

    }

    renderVerticalLine() {
        return <line x1="0" y1="0" x2="0" y2={this.getAvailableHeight()} style={{stroke:"rgb(255,0,0)", strokeWidth:1}} />    
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
          margin
        } = this.getConfiguredProperties();

        const label = (d) => d['value'];

        return (
            <div className="bar-graph">
                {
                    this.tooltip
                }
                <svg width={width} height={height}>
                    {this.axisTitles(this.getXTitlePositions(), this.getYTitlePositions())}
                    <g transform={ `translate(${this.getLeftMargin()},${margin.top})` } >
                        <g
                            key="xAxis"
                            ref={ (el) => select(el).call(this.getXAxis()) }
                            transform={ `translate(0,${this.getAvailableHeight()})` }
                        />
                        <g
                            key="yAxis"
                            ref={ (el) => select(el).call(this.getYAxis()) }
                        />

                        <g>
                              { this.getLines() }
                              { this.getAreas() }
                              { this.getCircle() }
                              
                        </g>
                        <g id="tooltip-line" transform={ `translate(0,0)` } style={{opacity : 0}}>
                            { this.renderVerticalLine() }
                            { this.getHoverCircle() }
                        </g>
                        <g>
                             { this.renderTooltip() }
                        </g>
                     
                    </g>
                    {this.renderLegend(this.getLegendsData(), this.getLegend(), this.getColor, label)}
                </svg>
            </div>
        );
    }
}
AreaGraph.propTypes = {
    configuration: React.PropTypes.object,
    response: React.PropTypes.object
};

const actionCreators = (dispatch) => ({
});

export default connect(null, actionCreators)(AreaGraph);
