import React from "react";
import XYGraph from "../XYGraph";
import { connect } from "react-redux";
import * as d3 from "d3";
import ReactTooltip from "react-tooltip";


import {
    line,
    brushX,
    area
} from "d3";

import {properties} from "./default.config";

class AreaGraph extends XYGraph {

  constructor(props) {
    super(props, properties);
    this.brush = brushX(); 
    this.node  = {};
  }

  componentWillMount() {
    this.initiate(this.props);
  }

  componentDidMount() {
    this.createElements();
  }

  componentWillReceiveProps(nextProps) {
    if(this.props !== nextProps) {
        this.initiate(nextProps);
    }
  }

  componentDidUpdate() {
    this.updateElements();
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
    this.elementGenerator();
  }

  getFilterDatas() {
    return this.filterDatas;
  }
  getLegend() {
    return this.legend;
  }

  getLegendsData() {
    return this.legendsData;
  }

  getDataNest() {
    return this.dataNest;
  }

  getLineGenerator() {
    return this.lineGenerator;
  }

  getAreaGenerator() {
    return this.areaGenerator;
  }

  getSVG() {
    return d3.select(this.node);
  }

  handleShowEvent() {
    this.getSVG().select(".tooltip-line").style("opacity", 1);
  }

  handleHideEvent() {
    this.hoveredDatum = null;
    this.getSVG().select(".tooltip-line").style("opacity", 0);
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

  setDimensions(props) {
    this.setYlabelWidth(this.getFilterDatas());
    this.setAvailableWidth(props);
    this.setAvailableHeight(props);
    this.setLeftMargin();
    this.setXBandScale(props.data);
    this.setYBandScale(props.data)
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

  // generate methods which helps to create charts
  elementGenerator() {

    const {
        xColumn,
    } = this.getConfiguredProperties();

    const xScale          = this.getXScale();
    const yScale          = this.getYScale();
    const availableHeight = this.getAvailableHeight();

    //Nest the entries by symbol
    this.dataNest = d3.nest()
      .key(function(d) {return d.columnType;})
      .entries(this.getFilterDatas());        

    this.lineGenerator = line()
      .x( d => xScale(d[xColumn]))
      .y( d => yScale(d[d.columnType]));  

   this.areaGenerator = area()
      .x(function(d, i) { return xScale(d[xColumn]); })
      .y0(function(d) { return availableHeight; })
      .y1(function(d) { return yScale(d[d.columnType]); })
  }
 
  // show circle if data length is 1.
  boundaryCircle() {

    const {
        circleRadius
    } = this.getConfiguredProperties();

    let boundaryCircle = this.getSVG().select('.area-chart').selectAll('.boundaryCircle')
      .data(this.getFilterDatas());

    boundaryCircle.enter().append("circle")
      .attr("class", "boundaryCircle")
      .style("fill", d => this.getColor({'key': d.columnType}))
      .attr("r", circleRadius)
     .merge(boundaryCircle)
      .attr("cx", d => this.getXScale()(d.xColumn))
      .attr("cy", d => this.getYScale()(d.yColumn));

    boundaryCircle.exit().remove();   
  }

  //tooltip circles
  tooltipCircle(data = null) {
    const {
        circleRadius
    } = this.getConfiguredProperties();

    const yScale = this.getYScale();
    const cy     = data ?  d => yScale(data[d['key']]) : 1

    const tooltipCircle = this.getSVG().select('.tooltip-line').selectAll('.tooltipCircle')
                            .data(this.getLegendsData(), d => d.key);

    tooltipCircle.enter().append("circle")
      .attr("class", "tooltipCircle")
      .style("fill", d => this.getColor(d))
      .attr("r", circleRadius)
     .merge(tooltipCircle)
      .attr("cx", 1)
      .attr("cy", cy);

    tooltipCircle.exit().remove();   
  }

  // generate new elements
  createElements() {
    const {
        data
    } = this.props

    const {
        stroke,
    } = this.getConfiguredProperties();

    const svg = this.getSVG();

    //Add the X Axis
    svg.append("g")
      .attr("class", "xAxis")
      .attr("transform", "translate(0,"+ this.getAvailableHeight() +")")
      .call(this.getXAxis());
  
    //Add the Y Axis
    svg.append("g")
      .attr("class", "yAxis")
      .call(this.getYAxis());

        
    if(data.length === 1) {

         this.boundaryCircle();

    } else {   

      this.getDataNest().forEach( function(d) {
        // Add lines
        svg.select('.area-chart').append("path")
            .attr("class", `line_${d.key}`)
            .style("stroke", this.getColor({'key': d.key}))
            .style("fill", "none")
            .style("strokeWidth", stroke.width)
            .attr("d", this.getLineGenerator()(d.values));

        // Add area
        svg.select('.area-chart').append("path")
            .attr("class", `area_${d.key}`)
            .style("fill", this.getColor({'key': d.key}))
            .style("opacity", stroke.opacity )
            .attr("d", this.getAreaGenerator()(d.values));
        }.bind(this)
      )

          // tooltip line and circles
      svg.select(".tooltip-line").append("line")
       .attr("class", "hover-line")
       .style("stroke", "rgb(255,0,0)")
       .attr("y2", this.getAvailableHeight());

      this.renderTooltip(); 
      this.tooltipCircle();
    }

    
  }
 
  // update data on props change or resizing
  updateElements() {
    const {
        data
    } = this.props  

    const svg =  this.getSVG();

    //Add the X Axis
    svg.select(".xAxis")
      .attr("transform", "translate(0,"+ this.getAvailableHeight() +")")
      .call(this.getXAxis());
  
    //Add the Y Axis
    svg.select(".yAxis")
      .call(this.getYAxis());

    if(data.length === 1) {
      this.boundaryCircle();
    } else {
      this.getDataNest().forEach( function(d) {
        //update lines
        svg.select(`.line_${d.key}`)
          .attr("d", this.getLineGenerator()(d.values));

        //update area
        svg.selectAll(`.area_${d.key}`)
          .attr("d", this.getAreaGenerator()(d.values));  
        }.bind(this)
      )

      // update tooltip svg
      this.renderTooltip();
      //update hover line
      svg.select(".hover-line")
       .attr("y2", this.getAvailableHeight());

    }
  }

  // Create tooltip data
  renderTooltip() {

    const {
      xColumn,
    } = this.getConfiguredProperties();

    let xScale    = this.getXScale();
    let bandwidth = this.getXBandScale().bandwidth() * 0.8;

    const tooltip = this.getSVG().select('.tooltip-section').selectAll('rect')
                      .data(this.getFilterDatas());

    const newTooltip = tooltip.enter().append('rect')
                         .attr("data-for", this.tooltipId)
                         .attr("data-effect", "solid")
                         .attr("data-tip", true)
                         .attr("y", 0)
                         .attr("width", bandwidth) 
                         .style("cursor", "pointer")
                         .style("opacity", 0)
                         .style("fill", "red");

    const allTooltip = newTooltip.merge(tooltip);  
    
    allTooltip     
      .attr("x", d => xScale(d[xColumn]) - (bandwidth)/2)
      .attr("height", this.getAvailableHeight())
      .on("mouseover",  d  => this.updateVerticalLine(d))
      .on("mouseenter", d => this.hoveredDatum = d)
      .on("mousemove",  d  => this.hoveredDatum = d);

    tooltip.exit().remove();        
     
  }

  //update vertical line on mouseover 
  updateVerticalLine(data) {
    const {
        xColumn,
      } = this.getConfiguredProperties();

      ReactTooltip.rebuild();   

      const rightMargin = this.getXScale()(data[xColumn]);
      this.tooltipCircle(data);
      this.getSVG()
       .select(".tooltip-line")
         .attr("transform", "translate("+rightMargin+", 0)");  
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
        margin,
        colors,
        stroke 
    } = this.getConfiguredProperties();

    const scale = this.scaleColor(this.getLegendsData(), 'key');
    
    this.getColor  = (d) => scale ? scale(d['key']) : stroke.color || colors[0];

    const label = (d) => d['value'];

    return (
        <div className="stacked-area-graph">

            { this.tooltip }

            <svg width={width} height={height}>
                <g ref={node => this.node = node} transform={ `translate(${this.getLeftMargin()},${margin.top})` }>
                    {this.newAxisTitles(this.getXTitlePositions(), this.getYTitlePositions())}

                    <g className="area-chart"></g>
                    <g className="tooltip-line" transform={ `translate(0,0)` } style={{opacity : 0}}></g>
                    <g className="tooltip-section"></g>

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
