import React from 'react'
import * as d3 from 'd3'
import { connect } from 'react-redux'
import { actions } from 'redux-tooltip'
import _ from 'lodash'


import { properties } from './default.config'
import XYGraph from '../XYGraph'
import "./style.css";

import { dataParser, pick, barWidth } from '../../../utils/helpers'

const FILTER_KEY = ['data', 'height', 'width', 'context']

class BarGraph extends XYGraph {

  origin = {
    x: 0,
    y: 0
  }

  customExtent = []

  constructor(props) {
    super(props, properties)
    this.handleLeave = this.handleLeave.bind(this)
    this.handleMove = this.handleMove.bind(this)
  }

  componentWillMount() {
    this.initiate(this.props)
  }

  componentDidMount() {
    this.elementGenerator()
    this.updateElements()
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(pick(this.props, ...FILTER_KEY), pick(nextProps, ...FILTER_KEY))
  } 

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(pick(this.props, ...FILTER_KEY), pick(nextProps, ...FILTER_KEY))) 
      this.initiate(nextProps)
  }

  componentDidUpdate() {
    this.updateElements()
  }

  getStackLabelFn() {
    return (d) => d[this.stack]
  }

  getMetricFn() {
    return (d) => d.total
  }

  // find min value (in case of others data, return sum of negative value)
  getMinFn() {
    return (d) => {
      return typeof d.min === 'undefined'
        ?
        d.values.reduce((total, curr) => {
          return total + parseFloat(curr[this.metric] < 0 ? curr[this.metric] : 0)
        }, 0)
       :
       d.min
    }
  }

  getMaxFn() {
    return (d) => typeof d.max === 'undefined' && d.total > 0 ? d.total : d.max
  }

  getDimensionFn() {
    return (d) => d.key
  }

  getGraph() {
    return this.getSVG().select('.graph-container')
  }

  getMinGraph() {
    return this.getSVG().select('.mini-graph-container');
  }

  initiate(props) {
    const {
      data
    } = props

    if (!data || !data.length)
        return

    this.parseData()
    this.setDimensions(props, this.getNestedData(), this.isVertical() ? 'total' : 'key')
    this.updateLegend()
    this.configureAxis({
      data: this.getNestedData()
    })
  }

  parseData() {
    const {
      data
    } = this.props

    const {
      xColumn,
      yColumn,
      stackColumn,
      otherOptions
    } = this.getConfiguredProperties()
 
    if (this.isVertical()) {
      this.dimension = xColumn
      this.metric = yColumn
    } else {
      this.dimension = yColumn
      this.metric = xColumn
    }

    this.stack = stackColumn || this.dimension

    this.nestedData = dataParser({
      data,
      dimension: this.dimension,
      metric: this.metric,
      stack: this.stack,
      otherOptions,
      vertical: this.isVertical()
    })

    // check condition to apply brush on chart
    this.isBrushable(this.nestedData)
  }

  getNestedData() {
    return this.nestedData
  }

  getDimension() {
    return this.dimension
  }

  getStack() {
    return this.stack
  }

  updateLegend() {
    const {
      data
    } = this.props

    const {
      chartHeightToPixel,
      chartWidthToPixel,
      circleToPixel,
      legend: originalLegend
    } = this.getConfiguredProperties()
    

    const legendWidth = this.longestLabelLength(data, this.getStackLabelFn()) * chartWidthToPixel    

    let legend = Object.assign({}, originalLegend)
    
    if (legend.show) {
      legend.width = legendWidth

      // Compute the available space considering a legend
      if (this.checkIsVerticalLegend()) {
        this.leftMargin += legend.width
        this.availableWidth -= legend.width
      }
      else {
        const nbElementsPerLine = parseInt(this.availableWidth / legend.width, 10)
        const nbLines = parseInt(data.length / nbElementsPerLine, 10)
        this.availableHeight -= nbLines * legend.circleSize * circleToPixel + chartHeightToPixel
      }

      this.legendConfig = legend
    }
  }

  getLegendConfig() {
    return this.legendConfig
  }

  // calculate range and make starting point from zero
  range(data) {
    this.customExtent = [d3.min(data, this.getMinFn()), d3.max(data, this.getMaxFn())]
    if(this.customExtent[0] > 0)
      this.customExtent[0] = 0

    if(this.customExtent[1] < 0)
      this.customExtent[1] = 0

    let difference = (this.customExtent[1] - this.customExtent[0]) * 0.05;

    if(this.customExtent[0] < 0)
      this.customExtent[0] = this.customExtent[0] - Math.abs(difference);

    if(this.customExtent[1] > 0)
      this.customExtent[1] = this.customExtent[1] + Math.abs(difference);

    return this.customExtent
}

  setScale(data) {
    const {
      dateHistogram,
      padding
    } = this.getConfiguredProperties()

    this.scale = {}
    
    if (dateHistogram) {

      // Handle the case of a vertical date histogram.
      this.scale.x = d3.scaleTime()
        .domain(d3.extent(data, this.getDimensionFn()))

        this.scale.y = d3.scaleLinear()
        .domain(this.range(data))

    } else if (this.isVertical()) {

      // Handle the case of a vertical bar chart.
      this.scale.x = d3.scaleBand()
        .domain(data.map(this.getDimensionFn()))
        .padding(padding)

      this.scale.y = d3.scaleLinear()
        .domain(this.range(data))

    } else {
      // Handle the case of a horizontal bar chart.
      this.scale.x = d3.scaleLinear()
        .domain(this.range(data))

      this.scale.y = d3.scaleBand()
        .domain(data.map(this.getDimensionFn()).reverse())
        .padding(padding)
    }

    this.scale.x.range([0, this.getAvailableWidth()])
    this.scale.y.range([this.getAvailableHeight(), 0])
  }

  // generate methods which helps to create charts
  elementGenerator() {
    
    const svg =  this.getGraph()

    //Add the X Axis
    svg.insert('g',':first-child')
      .attr('class', 'xAxis')

    //Add the Y Axis
    svg.insert('g',':first-child')
      .attr('class', 'yAxis')

    this.getMinGraph()
        .append("g")
        .attr("class", "brush")

    svg.append("defs").append("clipPath")
      .attr("id", `clip${this.getGraphId()}`)
      .append('rect')

    svg.select('.horizontal-line').append("line")
      .style("stroke", "black")
      .style("stroke-width", "0.4")

    this.getMinGraph().select('.min-horizontal-line').append("line")
      .style("stroke", "black")
      .style("stroke-width", "0.4")

    // generate elements for X and Y titles
   this.generateAxisTitleElement()

  }

  // update elements on component mount
  updateElements() {
    const {
      yTickFormat,
      chartWidthToPixel,
      yColumn,
      dateHistogram
    } = this.getConfiguredProperties()

    const svg =  this.getGraph()

    // set nested bar colors
    this.setColor()

    // set bar width
    this.setBarWidth()

    svg.select(`#clip${this.getGraphId()}`)
    .select("rect")
      .attr("x", this.isVertical() ? 0 : -this.getYlabelWidth())
      .attr("width", this.isVertical() ? this.getAvailableWidth() : this.getAvailableWidth() + this.getYlabelWidth())
      .attr("height", this.getAvailableHeight());

    //Add the X Axis
    const xAxis = svg.select('.xAxis')
      .style('clip-path',this.isVertical() ? `url(#clip${this.getGraphId()})` : null)
      .attr('transform', 'translate(0,'+ this.getAvailableHeight() +')')
      .call(this.getAxis().x)
      .selectAll('.tick text')

    if(this.isVertical()) {
      xAxis.call(this.wrapD3Text, this.getBarWidth())
    }

    const yLabelFn = (d) => d[yColumn]
    const yAxisLabelWidth = this.longestLabelLength(this.getNestedData(), yLabelFn, yTickFormat) * chartWidthToPixel

    //Add the Y Axis
    const yAxis = svg.select('.yAxis')
      .call(this.getAxis().y)

    if(!this.isVertical())
      yAxis.style('clip-path', `url(#clip${this.getGraphId()})`)

    if(!this.isVertical() && !dateHistogram) {
      yAxis.selectAll('.tick text')
        .call(this.wrapD3Text, yAxisLabelWidth)
    } 

    this.setAxisTitles()
    this.renderLegendIfNeeded()

    if(this.isBrush()) {
      this.configureMinGraph()
    } else {
      this.getSVG().select('.brush').select('*').remove()
      this.getSVG().select('.min-graph-bars').select('*').remove()
    }

    this.drawGraph({
      scale: this.getScale(),
      brush: false,
      svg
    })
  }

  setColor() {
    const {
      data
    } = this.props

    const {
      colorColumn,
      colors
    } = this.getConfiguredProperties()

    const scale = this.scaleColor(data, this.getStack())
    this.color =  (d) => scale ? scale(d[colorColumn || this.getStack()]) : colors[0]
  }

  getColor() {
    return this.color
  }

  setBarWidth() {
    const {
      dateHistogram,
      interval
    } = this.getConfiguredProperties()

    if (dateHistogram) {
      this.barWidth = barWidth(interval, this.getScale().x)
    } else if (this.isVertical()) {
      this.barWidth = this.getScale().x.bandwidth()
    }
  }

  getBarWidth() {
    return this.barWidth
  }
 
  renderLegendIfNeeded() {
    const {
      data
    } = this.props

    this.renderNewLegend(data, this.getLegendConfig(), this.getColor(), this.getStackLabelFn())
  }

  getBarDimensions(scale) {

    return (
        this.isVertical() ? {
            x: d => scale.x(d.key),
            y: d => scale.y(d.y1 >= 0 ? d.y1 : d.y0),
            width: scale.x.bandwidth(),
            height: d => d.y1 >= 0 ? scale.y(d.y0) - scale.y(d.y1) : scale.y(d.y1) - scale.y(d.y0),
            initialY: d => scale.y(0),
            initialHeight: 0,
            get initialX() { return this.x},
            get initialWidth() { return this.width}
        } : {
            x: d => scale.x(d.y1 >= 0 ? d.y0 : d.y1),
            y: d => scale.y(d.key),
            width: d => d.y1 >= 0 ? scale.x(d.y1) - scale.x(d.y0) : scale.x(d.y0) - scale.x(d.y1),
            height: d => scale.y.bandwidth(),
            initialWidth: 0,
            initialX: d => scale.x(0),
            get initialY() { return this.y },
            get initialHeight() { return this.height }
        }
    )
  }

  drawGraph({
    scale,
    brush = false,
    svg
  }) {

    let self = this

    const {
      onMarkClick
    } = this.props

    const {
      stroke,
      otherOptions,
      loadSpeed
    } = this.getConfiguredProperties()

    const classPrefix = brush ? 'min-' : ''

    this.drawHorizontalLine(svg.select(`.${classPrefix}horizontal-line`), scale)

    // draw stacked bars
    const bars = svg.select(`.${classPrefix}graph-bars`)
      .selectAll(`.${classPrefix}bar-block`)
      .data(this.getNestedData(), d => d.key )

    const newBars = bars.enter().append('g')
      .attr('class', `${classPrefix}bar-block`)
      .style('clip-path', `url(#clip${this.getGraphId()})`)

    newBars.append('rect')
      .style('stroke', stroke.color)
      .style('stroke-width', stroke.width)

    const allBars = newBars.merge(bars)
    const nestedBars = allBars.selectAll('rect')
      .data( d =>  d.values.map( datum => Object.assign(datum, {key: d.key} )))

    const newNestedBars = nestedBars.enter().append('rect')
    const allNestedbars = newNestedBars.merge(nestedBars)

    const {
      x,
      y,
      width,
      height,
      initialX,
      initialY,
      initialHeight,
      initialWidth
    } = this.getBarDimensions(scale)

    allNestedbars
      .style('cursor', onMarkClick ? 'pointer' : '')
      .style('fill', this.getColor())
      .attr('x', initialX)
      .attr('y', initialY)
      .attr('height', initialHeight)
      .attr('width', initialWidth)
      .on('click', d => {
          this.handleLeave()
          onMarkClick && (!otherOptions || d[this.getDimension()] !== otherOptions.label)
          ?  onMarkClick(d) 
          : ''
        }
      )

      .transition()
       .duration(loadSpeed)//time in ms
        .attr('height', height)
        .attr('width', width)
        .attr('x', x)
        .attr('y', y)
        .on('end', function () {
          d3.select(this)
            .on('mousemove', d => {
                self.hoveredDatum = d
                self.handleMove()
              }
            )
            .on('mouseleave', self.handleLeave)
          })

    // Remove all remaining nodes        
    bars.exit().remove()
  }

  handleMove() {
    const { tooltip } = this.configuredProperties

    if (tooltip) {
      let x = d3.event.pageX
      let y = d3.event.pageY

      if(this.origin.x != x  || this.origin.y != y) {
        this.origin = {
          x,
          y
        }
        this.props.showTooltip(this.getTooltipContent(), this.origin)
      }
    }
  }

  handleLeave() {
    const { tooltip } = this.configuredProperties
    
    if (tooltip) {
      this.hoveredDatum = null
      this.props.hideTooltip()
    }
  }

  // draw line from which bars will be draw
  drawHorizontalLine(svg, scale) {

    if(this.customExtent.length && this.customExtent[0] < 0 && this.customExtent[1] > 0) {
      this.isVertical() ?
        svg.select("line")
        .attr("x1", 0)
        .attr("y1", scale.y(0))
        .attr("x2", this.getAvailableWidth())
        .attr("y2", scale.y(0))
      :
        svg.select("line")
        .attr("x1", scale.x(0))
        .attr("y1", 0)
        .attr("x2", scale.x(0))
        .attr("y2", this.getAvailableHeight())
    }
  }

  configureMinGraph() {
    const {
      data
    } = this.props

    if (!data || !data.length)
      return

    const {
      margin,
      padding,
      brush
    } = this.getConfiguredProperties()

    const svg   = this.getMinGraph(),
          scale = this.getScale(),
          minScale = { x: {}, y: {}}

    let range, brushXY, mainZoom

    if(this.isVertical()) {

      svg.attr('transform', `translate(${this.getLeftMargin()},${this.getMinMarginTop()})`)
      mainZoom = d3.scaleLinear()
        .range([0, this.getAvailableWidth()])
        .domain([0, this.getAvailableWidth()])

      minScale.x = d3.scaleBand()
        .domain(scale.x.domain())
        .padding(padding)

      minScale.y = d3.scaleLinear()
        .domain(scale.y.domain());

      minScale.x.range([0, this.getAvailableWidth()])
      minScale.y.range([this.getAvailableMinHeight(), 0])

      brushXY = d3.brushX()
        .extent([[0, 0], [this.getAvailableWidth(), this.getAvailableMinHeight()]])

      range = [0, (this.getAvailableWidth()/this.getNestedData().length) * brush]

    } else {

      svg.attr('transform', `translate(${this.getMinMarginLeft()},${margin.top})`)

      mainZoom = d3.scaleLinear()
        .range([this.getAvailableHeight(), 0])
        .domain([0, this.getAvailableHeight()])

      minScale.x = d3.scaleLinear()
        .domain(scale.x.domain())

      minScale.y = d3.scaleBand()
        .domain(scale.y.domain())
        .padding(padding);

      minScale.x.range([0, this.getAvailableMinWidth()])
      minScale.y.range([this.getAvailableHeight(), 0])

      range = [0, (this.getAvailableHeight()/this.getNestedData().length) * brush]

      brushXY = d3.brushY()
        .extent([[0, 0], [this.getAvailableMinWidth(), this.getAvailableHeight()]])
    }

    this.brushing = brushXY
      .on("brush end", () => {
        const scale = this.getScale(),
          originalRange = mainZoom.range()

        let [start, end] = d3.event.selection || range;

        if(this.isVertical()) {
          mainZoom.domain([start, end]);
          scale.x.range([mainZoom(originalRange[0]), mainZoom(originalRange[1])]);
          this.getGraph().select(".xAxis").call(this.getAxis().x);
        } else {
          mainZoom.domain([end, start]);
          scale.y.range([mainZoom(originalRange[0]), mainZoom(originalRange[1])]);
          this.getGraph().select(".yAxis").call(this.getAxis().y);
        }

        const {
          x,
          y,
          width,
          height
        } = this.getBarDimensions(scale)

        this.getGraph().selectAll(".bar-block").selectAll("rect")
          .attr('x', x)
          .attr('y', y)
          .attr('width', width)
          .attr('height', height)

      });

    svg.select(".brush")
      .call(this.brushing)
      .call(this.brushing.move, range);

    // draw stacked bars
    this.drawGraph({scale: minScale, brush: true, svg})

  }

  render() {
    const {
      data,
      width,
      height
    } = this.props

    if (!data || !data.length)
      return

    const {
      margin
    } = this.getConfiguredProperties()

    let horizontalLine = (
        this.isVertical() ? <line
            x1="0"
            y1={this.scale.y(0)}
            x2={this.getAvailableWidth()}
            y2={this.scale.y(0)}
            stroke={"rgb(0,0,0)"}
            strokeWidth="0.7"
        /> :
        <line
            x1={this.scale.x(0)}
            y1="0"
            x2={this.scale.x(0)}
            y2={this.getAvailableHeight()}
            stroke={"rgb(0,0,0)"}
            strokeWidth="0.7"
        />
    )

    return (
      <div className='dynamic-bar-graph'>
        <svg width={width} height={height}>
          <g ref={node => this.node = node}>
            <g className='graph-container' transform={`translate(${this.getLeftMargin()},${margin.top})`}>
            {horizontalLine}
              <g className='graph-bars'></g>
              <g className='tooltip-section'></g>
            </g>
            <g className='mini-graph-container'>
              <g className='min-horizontal-line'></g>
              <g className='min-graph-bars'></g>
            </g>
            <g className='axis-title'></g>
            <g className='legend'></g>
          </g>
        </svg>
      </div>
    )
  }
}

BarGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.arrayOf(React.PropTypes.object)
}

const mapStateToProps = (state, ownProps) =>  {
  return {}
}

const actionCreators = (dispatch) => ({

  showTooltip: function(data, origin) {
      dispatch(actions.show({
        origin,
        content: data
      }))
  },
  
  hideTooltip: function() {
    dispatch(actions.hide())
  }

})

export default connect(mapStateToProps, actionCreators)(BarGraph)
