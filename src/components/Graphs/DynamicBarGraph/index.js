import React from 'react'
import * as d3 from 'd3'
import { connect } from 'react-redux';
import { actions } from 'redux-tooltip';
import _ from 'lodash'

import { properties } from './default.config'
import XYGraph from '../XYGraph'

import { barGraphParser, pick, constants } from '../../../utils/helpers'


function computeBarWidth(interval, timeScale) {
  const step = +interval.substr(0, interval.length - 1);

  // TODO handle case of 'ms'
  const abbreviation = interval.substr(interval.length - 1);
  const d3Interval = constants.timeAbbreviations[abbreviation];

  // TODO validation and error handling
  const start = new Date(2000, 0, 0, 0, 0);
  const end = d3[d3Interval].offset(start, step);

  return timeScale(end) - timeScale(start);
}

const FILTER_KEY = ['data', 'height', 'width', 'context']

class BarGraph extends XYGraph {

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

  getDimensionFn() {
    return (d) => d.key
  }

  getGraph() {
    return this.getSVG().select('.graph-container')
  }

  isVertical() {
    const {
      orientation
    } = this.getConfiguredProperties()

    return orientation === 'vertical'
  }

  initiate(props) {
    const {
      data
    } = props

    if (!data || !data.length)
        return; 

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

    this.nestedData = barGraphParser({
      data,
      dimension: this.dimension,
      metric: this.metric,
      stack: this.stack,
      otherOptions,
      vertical: this.isVertical()
    })
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
    

    const legendWidth = this.longestLabelLength(data, this.getStackLabelFn()) * chartWidthToPixel;    

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
        .domain([0, d3.max(data, this.getMetricFn())])

    } else if (this.isVertical()) {

      // Handle the case of a vertical bar chart.
      this.scale.x = d3.scaleBand()
        .domain(data.map(this.getDimensionFn()))
        .padding(padding)

      this.scale.y = d3.scaleLinear()
        .domain([0, d3.max(data, this.getMetricFn())])

    } else {
      // Handle the case of a horizontal bar chart.
      this.scale.x = d3.scaleLinear()
        .domain([0, d3.max(data, this.getMetricFn())])

      this.scale.y = d3.scaleBand()
        .domain(data.map(this.getDimensionFn()))
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

    //Add the X Axis
    const xAxis = svg.select('.xAxis')
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

    if(!this.isVertical() && !dateHistogram) {
      yAxis.selectAll('.tick text')
        .call(this.wrapD3Text, yAxisLabelWidth)
    } 

    this.setAxisTitles()
    this.renderLegendIfNeeded()
    this.drawGraph()
    
  }

  setColor() {
    const {
      data
    } = this.props

    const {
      colorColumn,
      colors
    } = this.getConfiguredProperties();

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
    } = this.getConfiguredProperties();

    if (dateHistogram) {
      this.barWidth = computeBarWidth(interval, this.getScale().x)
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

  drawGraph() {

    let self = this

    const {
      onMarkClick
    } = this.props

    const {
      stroke,
      otherOptions,
      loadSpeed
    } = this.getConfiguredProperties()

    const svg =  this.getGraph()
    const scale = this.getScale()    

    // draw stacked bars
    const bars = svg.select('.graph-bars')
      .selectAll('.bar-block')
      .data(this.getNestedData(), d => d.key )

    const newBars = bars.enter().append('g')
      .attr('class', 'bar-block')

    newBars.append('rect')
      .style('stroke', stroke.color)
      .style('stroke-width', stroke.width)

    const allBars = newBars.merge(bars)


    const {
      x,
      y,
      width,
      height,
      initialX,
      initialY,
      initialHeight,
      initialWidth
    } = (
        this.isVertical() ? {
            x: d => scale.x(d.key),
            y: d => scale.y(d.y1),
            width: this.getBarWidth(),
            height: d => scale.y(d.y0) - scale.y(d.y1),
            initialY: d => scale.y(0),
            initialHeight: 0,
            get initialX() { return this.x},
            get initialWidth() { return this.width}
        } : {
            x: d => scale.x(d.y0),
            y: d => scale.y(d.key),
            width: d => scale.x(d.y1) - scale.x(d.y0),
            height: d => scale.y.bandwidth(),
            initialWidth: 0,
            initialX: d => scale.x(0),
            get initialY() { return this.y },
            get initialHeight() { return this.height }
        }
    );
   

    const nestedBars = allBars.selectAll('rect')
      .data( d =>  d.values.map( datum => Object.assign(datum, {key: d.key} )))

    const newNestedBars = nestedBars.enter().append('rect')
    const allNestedbars = newNestedBars.merge(nestedBars)

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
                self.handleMove(self.getTooltipContent(d))
              }
            )
            .on('mouseleave', self.handleLeave)
          })
        
    // Remove all remaining nodes        
    bars.exit().remove();
  }

  handleMove(data) {
    this.props.showTooltip(data)
  }

  handleLeave() {
    this.props.hideTooltip();
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

    return (
      <div className='dynamic-bar-graph'>
        <svg width={width} height={height}>
          <g ref={node => this.node = node}>
            <g className='graph-container' transform={`translate(${this.getLeftMargin()},${margin.top})`} >
              <g className='graph-bars'></g>
              <g className='tooltip-section'></g>
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

  showTooltip: function(data) {
      dispatch(actions.show({
        origin: {
          x: d3.event.pageX,
          y: d3.event.pageY
        },
        content: data
      }));
  },
  
  hideTooltip: function() {
    dispatch(actions.hide());
  }

});

export default connect(mapStateToProps, actionCreators)(BarGraph);

