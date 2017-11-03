import React from 'react';
import XYGraph from '../XYGraph';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import ReactTooltip from 'react-tooltip';

import {
    line,
    area
} from 'd3';

import { properties } from './default.config';

class AreaGraph extends XYGraph {

  constructor(props) {
    super(props, properties);
  }

  componentWillMount() {
    this.initiate(this.props);
  }

  componentDidMount() {
    this.elementGenerator();
    this.updateElements();
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

    this.setDimensions(props, this.getData());
    this.updateLegend();
    this.configureAxis(this.getData());
  }

  getYColumns() {
    return this.yColumns;
  }

  getData() {
    return this.data;
  }

  getLegendConfig() {
    return this.legendConfig;
  }

  getDataNest() {
    return this.dataNest;
  }

  getGraph() {
    return this.getSVG().select('.graph-container');
  }

  handleShowEvent() {
    this.getSVG().select('.tooltip-line').style('opacity', 1);
  }

  handleHideEvent() {
    this.hoveredDatum = null;
    this.getSVG().select('.tooltip-line').style('opacity', 0);
  }

  updateTooltipConfiguration() {
    const {
      tooltip,
      linesColumn,
      yColumn
    } = this.getConfiguredProperties();

    const yColumns = this.getYColumns();

    let updatedTooltip = [];
    
    let insertTooltip = false;
    let format = null;
    
    if(tooltip) {
      tooltip.forEach(t => {

        //Checking whether need to insert all the dynamic values
        if([linesColumn, yColumn].indexOf(t.column) !== -1) {
          insertTooltip = true;

          //If Format is specified for metric column
          if(t.column == yColumn && t.format) {
            format = t.format;
          }
        } else {
          updatedTooltip.push(Object.assign({}, t));
        }

      })

      if(insertTooltip) {
        yColumns.forEach(column => {
          updatedTooltip.push({
            column: column.key,
            format: format
          })
        })
      }
  
      this.setTooltipAccessor(updatedTooltip)
    }
   
  }

  parseData() {
    let {
        data
    } = this.props;

    const {
        yColumn,
        xColumn,
        linesColumn
    } = this.getConfiguredProperties();

    this.data = [];

    if(linesColumn) {
      //Finding all the distinct lines
      this.yColumns = [...new Set(data.map(item => item[linesColumn]))]
        .map(d => ({key: d}));

      let groupedData = d3.nest()
        .key(function(d) {return d[xColumn];})
        .entries(data);

      this.data = [];
      groupedData.forEach(group => {
        //Generating the partial to append to each object will be used in tooltip
        let partial = {};
        group.values.forEach(d => {
          partial[d[linesColumn]] = d[yColumn];
        });

        group.values.forEach(d => {
          this.data.push(Object.assign({}, d, {
            yColumn: d[yColumn],
            columnType: d[linesColumn]
          }, partial));
        })
      })

      this.updateTooltipConfiguration();
      
    } else {

      this.yColumns = typeof yColumn === 'object' ? yColumn : [{ key: yColumn }];

      data.forEach((d) => {
        this.getYColumns().forEach((ld) => {
            if(d[ld.key] !== null) {
              this.data.push(Object.assign({
                  yColumn: d[ld.key] !== null ? d[ld.key] : 0,
                  columnType: ld.key
              }, d));
            }
        });
      });

    }

    //Nest the entries by symbol
    this.dataNest = d3.nest()
      .key(function(d) {return d.columnType;})
      .entries(this.data);

    //this.dataNest;

    return;
  }

  updateLegend() {

    const {
        chartHeightToPixel,
        chartWidthToPixel,
        circleToPixel,
        legend,
    } = this.getConfiguredProperties();

    
    if (legend.show)
    {
        const legendFn   = (d) => (d.value) ? d.value : d.key;
        let legendWidth  = legend.show && this.getYColumns().length >= 1 ? this.longestLabelLength(this.getYColumns(), legendFn) * chartWidthToPixel : 0;
  
        legend.width = legendWidth;

        // Compute the available space considering a legend
        if (this.checkIsVerticalLegend())
        {          
            this.leftMargin      +=  legend.width;
            this.availableWidth  -=  legend.width;
        } else {
            const nbElementsPerLine  = parseInt(this.getAvailableWidth() / legend.width, 10);
            const nbLines            = parseInt(this.getYColumns().length / nbElementsPerLine, 10);
            this.availableHeight    -= nbLines * legend.circleSize * circleToPixel + chartHeightToPixel;
        }
    }
    this.legendConfig = legend;
  }
  

  // generate methods which helps to create charts
  elementGenerator() {

    const svg =  this.getGraph();

    //Add the X Axis
    svg.append('g')
      .attr('class', 'xAxis');
  
    //Add the Y Axis
    svg.append('g')
      .attr('class', 'yAxis');

    // tooltip line and circles
    svg.select('.tooltip-line').append('line')
      .attr('class', 'hover-line')
      .style('stroke', 'rgb(255,0,0)');

    // for generating transition   
    svg.select('.area-chart')
     .append('clipPath')
       .attr('id', `clip-${this.getGraphId()}`)
      .append('rect')
        .attr('width', 0);  

    // generate elements for X and Y titles
    this.generateAxisTitleElement();
  }
 
  // show circle if data length is 1.
  boundaryCircle() {

    const {
        circleRadius
    } = this.getConfiguredProperties();

    let boundaryCircle = this.getGraph()
      .select('.area-chart')
      .selectAll('.boundaryCircle')
      .data(this.getData());

    boundaryCircle.enter().append('circle')
        .attr('class', 'boundaryCircle')
        .style('fill', d => this.getColor({'key': d.columnType}))
        .attr('r', circleRadius)
      .merge(boundaryCircle)
        .attr('cx', d => this.getScale().x(d.xColumn))
        .attr('cy', d => this.getScale().y(d.yColumn));

    boundaryCircle.exit().remove();   
  }

  //tooltip circles
  tooltipCircle(data = null) {
    const {
        circleRadius,
        xColumn
    } = this.getConfiguredProperties();

    const yScale = this.getScale().y;
    const cy     = data 
      ? (d, i) => {
        return data[d.key] ? yScale(data[d.key]) : -50
      } 
      : 1

    const tooltipCircle = this.getGraph()
        .select('.tooltip-line').selectAll('.tooltipCircle')
        .data(this.getDataNest(), d => d.key);

    tooltipCircle.enter().append('circle')
        .attr('class', 'tooltipCircle')
        .style('fill', d => this.getColor(d))
        .attr('r', circleRadius)
      .merge(tooltipCircle)
        .attr('cx', 1)
        .attr('cy', cy);

    tooltipCircle.exit().remove();   
  }

  drawArea() {

    const {
      opacity,
      xColumn,
      transition,
      strokeWidth
    } = this.getConfiguredProperties();

    const scale          = this.getScale();
    const availableHeight = this.getAvailableHeight();

    const lineGenerator = line()
      .x( d => scale.x(d[xColumn]))
      .y( d => scale.y(d.yColumn));  

    const areaGenerator = area()
      .x( d => scale.x(d[xColumn]))
      .y0( d => availableHeight)
      .y1( d => scale.y(d.yColumn));

    const svg   =  this.getGraph();

    svg.select('.area-chart')
      .select(`#clip-${this.getGraphId()}`)
      .select('rect')
        .attr('height', availableHeight);

    const lines = svg.select('.area-chart')
        .selectAll('.line-block')
        .data(this.getDataNest(), d => d.key );

    const newLines = lines.enter().append('g')
        .attr('class', 'line-block');

    newLines.append('path')
        .attr('class', 'line')
        .style('fill', 'none')
        .style('strokeWidth', strokeWidth)
        .attr('clip-path', `url(#clip-${this.getGraphId()})`);

    const allLines = newLines.merge(lines); 

    allLines.select('.line')
        .style('stroke', d => this.getColor({'key': d.key}))
        .attr('d', d => lineGenerator(d.values));    

    // Add area

    const areas = svg.select('.area-chart')
        .selectAll('.area-block')
        .data(this.getDataNest(), d => d.key );

    const newAreas = areas.enter()
       .append('g')
       .attr('class', 'area-block');

    newAreas.append('path')
        .attr('class', 'area')
        .attr('fill-opacity', opacity)
        .attr('clip-path', `url(#clip-${this.getGraphId()})`);

    const allAreas = newAreas.merge(areas); 

    allAreas.select('.area')
        .style('fill', d => this.getColor({'key': d.key}))
        .attr('d', d => areaGenerator(d.values));

    // add transition effect
    svg.select(`#clip-${this.getGraphId()} rect`)
        .transition().duration(transition)
        .attr('width', this.availableWidth);

    lines.exit().remove();
    //areas.exit().remove();  

  }
 
  // update data on props change or resizing
  updateElements() {
    const {
        data
    } = this.props  

    const {
      xTickFontSize,
      yTickFontSize
    } = this.getConfiguredProperties();

    const svg =  this.getGraph();

    //Add the X Axis
    svg.select('.xAxis')
      .style('font-size', xTickFontSize)
      .attr('transform', 'translate(0,'+ this.getAvailableHeight() +')')
      .call(this.getAxis().x);
  
    //Add the Y Axis
    svg.select('.yAxis')
      .style('font-size', yTickFontSize)
      .call(this.getAxis().y);

    this.setAxisTitles();
    this.renderLegendIfNeeded();  

    if(data.length === 1) {
      this.boundaryCircle();
    } else {

      this.drawArea();

      // update tooltip svg
      this.renderTooltip();

      //update hover line
      svg.select('.hover-line')
       .attr('y2', this.getAvailableHeight());

    }
  }

  renderLegendIfNeeded() {
    const {
      stroke,
      colors
    } = this.getConfiguredProperties();

    const label    = (d) => d.value ? d.value : d.key;
    const scale    = this.scaleColor(this.getYColumns(), 'key');
    this.getColor  = (d) => scale ? scale(d.key) : stroke.color || colors[0];
    
    this.renderNewLegend(this.getYColumns(), this.getLegendConfig(), this.getColor, label);
  }

  // Create tooltip data
  renderTooltip() {

    const {
      xColumn,
    } = this.getConfiguredProperties();

    let scale    = this.getScale();
    let bandwidth = this.getBandScale().x.bandwidth() * 0.8;

    const tooltip = this.getGraph()
        .select('.tooltip-section').selectAll('rect')
        .data(this.getData());

    const newTooltip = tooltip.enter().append('rect')
        .attr('data-for', this.tooltipId)
        .attr('data-effect', 'solid')
        .attr('data-tip', true)
        .attr('y', 0)
        .attr('width', bandwidth) 
        .style('cursor', 'pointer')
        .style('opacity', 0)
        .style('fill', 'red');

    const allTooltip = newTooltip.merge(tooltip);  
    
    allTooltip     
        .attr('x', d => scale.x(d[xColumn]) - (bandwidth)/2)
        .attr('height', this.getAvailableHeight())
        .on('mouseover',  d  => this.updateVerticalLine(d))
        .on('mouseenter', d => this.hoveredDatum = d)
        .on('mousemove',  d  => this.hoveredDatum = d);

    tooltip.exit().remove();
  }

  //update vertical line on mouseover 
  updateVerticalLine(data) {
    const {
        xColumn,
      } = this.getConfiguredProperties();

      ReactTooltip.rebuild();   

      const rightMargin = this.getScale().x(data[xColumn]);
      this.tooltipCircle(data);
      this.getGraph()
       .select('.tooltip-line')
         .attr('transform', 'translate('+rightMargin+', 0)');  
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

    return (
        <div className='stacked-area-graph'>
            
            { this.tooltip }

            <svg width={width} height={height}>
              <g ref={node => this.node = node}>
                <g className='graph-container' transform={ `translate(${this.getLeftMargin()},${margin.top})` }>
                    <g className='area-chart'></g>
                    <g className='tooltip-line' transform={ `translate(0,0)` } style={{opacity : 0}}></g>
                    <g className='tooltip-section'></g>
                </g>
                <g className='axis-title'></g>
                <g className='legend'></g>
              </g>  
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