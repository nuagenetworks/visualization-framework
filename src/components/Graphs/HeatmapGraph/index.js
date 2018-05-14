import React from "react"
import XYGraph from "../XYGraph"
import _ from 'lodash'
import { connect } from 'react-redux'
import { actions } from 'redux-tooltip'
import * as d3 from "d3"

import {properties} from "./default.config"
import { nest as dataNest, pick } from "../../../utils/helpers"

const FILTER_KEY = ['data', 'height', 'width', 'context']


class HeatmapGraph extends XYGraph {

  constructor(props) {
    super(props, properties)
    this.handleLeave = this.handleLeave.bind(this)
    this.handleMove = this.handleMove.bind(this)
    this.origin = {
      x: 0,
      y: 0
    }
  }

  componentWillMount() {
    this.initiate(this.props)
  }

  componentDidMount() {
    this.elementGenerator()
    this.updateElements()
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(pick(this.props, ...FILTER_KEY), pick(nextProps, ...FILTER_KEY))
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(pick(this.props, ...FILTER_KEY), pick(nextProps, ...FILTER_KEY)))
      this.initiate(nextProps)
  }

  componentDidUpdate() {
    this.updateElements()
  }

  initiate(props) {
    const {
      data
    } = props

    const {
      yColumn
    } = this.getConfiguredProperties()

    if (!data || !data.length)
      return

    this.parseData(props)
    this.setDimensions(props, this.getFilterData(), yColumn)
    this.updateLegend(props)
    this.configureAxis({
      data: this.getFilterData()
    })
  }

  parseData(props) {
    const {
      data: cdata
    } = props

    const {
      xColumn,
      yColumn,
      legendColumn
    } = this.getConfiguredProperties()

    this.nestedXData = dataNest({
      data: cdata,
      key: xColumn,
      sortColumn: xColumn
    })

    this.nestedYData = dataNest({
      data: cdata,
      key: yColumn,
      sortColumn: yColumn
    })

    this.filterData = []

    // Check x column data, if not found set to null
    this.nestedYData.forEach(item => {

      if (!item.key || typeof item.key === 'object' || item.key === 'null')
        return

      const d = Object.assign({}, item)

      // Inserting new object if data not found
      this.nestedXData.forEach(list => {
        if (!list.key || typeof list.key === 'object')
          return

        const index = (d.values).findIndex(o => {
          return `${o[xColumn]}` === `${list.key}`
        })

        if (index !== -1
          && d.values[index][yColumn] !== ""
          && typeof d.values[index][yColumn] !== 'undefined'
          && typeof d.values[index][yColumn] !== 'object'
        ) {
          this.filterData.push(d.values[index])
        } else {
          this.filterData.push({
            [yColumn]: d.key,
            [legendColumn]: 'Empty',
            [xColumn]: parseInt(list.key)
          })
        }
      })
    })

    this.cellColumnsData  = d3.nest()
      .key((d) => legendColumn ? d[legendColumn] : "Cell")
      .entries(this.filterData)

    // check condition to apply brush on chart
    if(this.filterData.length)
      this.isBrushable(this.nestedYData)
  }

  getNestedYData() {
    return this.nestedYData || []
  }

  getNestedXData() {
    return this.nestedXData || []
  }

  getFilterData() {
    return this.filterData || []
  }

  getCellColumnData() {
    return this.cellColumnsData || []
  }

  updateLegend(props) {
    const {
      data
    } = props

    const {
      chartHeightToPixel,
      chartWidthToPixel,
      circleToPixel,
      legend: originalLegend
    } = this.getConfiguredProperties()
    

    const legendWidth = this.longestLabelLength(this.getFilterData(), this.getLegendFn()) * chartWidthToPixel    

    const legend = Object.assign({}, originalLegend)
    
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

  getXLabelFn() {
    const {
      xColumn
    } = this.getConfiguredProperties()

    return (d) => d[xColumn]
  }

  getYLabelFn() {
    const {
      yColumn
    } = this.getConfiguredProperties()

    return (d) => d[yColumn]
  }

  getLegendFn() {
    const {
      legendColumn
    } = this.getConfiguredProperties()

    return (d) => d[legendColumn]
  }

  setBoxSize() {
    const {
      brush
    } = this.getConfiguredProperties()

    const height =  this.getAvailableHeight()/( this.isBrush() ? brush : this.getNestedYData().length),
        width  = this.getAvailableWidth()/this.getNestedXData().length

    this.boxSize = { height, width}
  }

  getBoxSize() {
    return this.boxSize || 0
  }

  setScale(data) {
    const {
      xAlign
    } = this.getConfiguredProperties()

    const distXDatas = d3.map(data, this.getXLabelFn()).keys().sort()
    const distYDatas = d3.map(data, this.getYLabelFn()).keys().sort()

    const xValues = d3.extent(data, this.getXLabelFn())
    const xPadding = distXDatas.length > 1 ? ((xValues[1] - xValues[0]) / (distXDatas.length - 1)) / 2 : 1

    this.setBoxSize()

    let minValue = xValues[0]
    let maxValue = xValues[1]

    if(xAlign) {
        maxValue += xPadding * 2
    } else {
        minValue -= xPadding
        maxValue += xPadding
    }

    this.scale = {}

    this.scale.x = d3.scaleTime()
        .domain([minValue, maxValue])

    this.scale.y = d3.scaleBand()
        .domain(distYDatas)

    this.scale.x.range([0, this.getAvailableWidth()])
    this.scale.y.rangeRound([this.getAvailableHeight(), 0])
  }

  setAxis(data) {

    const {
      xTickSizeInner,
      xTickSizeOuter,
      xTickFormat,
      xTickGrid,
      yTickFormat,
      yTickGrid,
      yTicks,
      yTickSizeInner,
      yTickSizeOuter,
    } = this.getConfiguredProperties()

    const distXDatas = d3.map(data, this.getXLabelFn()).keys().sort()

    this.axis = {}

    this.axis.x = d3.axisBottom(this.getScale().x)
      .tickSizeInner(xTickGrid ? -this.getAvailableHeight() : xTickSizeInner)
      .tickSizeOuter(xTickSizeOuter)

    if(xTickFormat){
      this.axis.x.tickFormat(d3.format(xTickFormat))
    }

    this.axis.x.tickValues(distXDatas)

    this.axis.y = d3.axisLeft(this.getScale().y)
      .tickSizeInner(yTickGrid ? -this.getAvailableWidth() : yTickSizeInner)
      .tickSizeOuter(yTickSizeOuter)

    if(yTickFormat){
      this.axis.y.tickFormat(d3.format(yTickFormat))
    }

    if(yTicks){
      this.axis.y.ticks(yTicks)
    }
  }

  getGraph() {
    return this.getSVG().select('.graph-container')
  }

  getMinGraph() {
    return this.getSVG().select('.mini-graph-container');
  }

  // generate methods which helps to create charts
  elementGenerator() {
    const svg =  this.getGraph()

    svg.append("defs").append("clipPath")
      .attr("id", `clip${this.getGraphId()}`)
      .append('rect')

  }

  // update data on props change or resizing
  updateElements() {
    const {
      data
    } = this.props

    const {
      xTickFontSize,
      yTickFontSize,
      yLabelLimit
    } = this.getConfiguredProperties()

    if (!data || !data.length)
      return

    const svg = this.getGraph()

    svg.select(`#clip${this.getGraphId()}`)
    .select("rect")
      .attr("x", -this.getYlabelWidth())
      .attr("width", this.getAvailableWidth() + this.getYlabelWidth())
      .attr("height", this.getAvailableHeight());

    //Add the X Axis
    svg.select('.xAxis')
      .style('font-size', xTickFontSize)
      .attr('transform', 'translate(0,' + this.getAvailableHeight() + ')')
      .call(this.getAxis().x)

    //Add the Y Axis
    const yAxis = svg.select('.yAxis')
      .style('font-size', yTickFontSize)
      .style('clip-path', `url(#clip${this.getGraphId()})`)
      .call(this.getAxis().y)

      yAxis.selectAll('.tick text')
        .call(this.wrapD3Text, yLabelLimit)

    this.setAxisTitles()
    this.renderLegendIfNeeded()
    // check to enable/disable brushing
    if(this.isBrush()) {
      this.configureMinGraph()
    } else {
      this.getSVG().select('.brush').select('*').remove()
      this.getSVG().select('.min-heatmap').select('*').remove()
    }

    this.drawGraph({
      scale: this.getScale(),
      brush: false,
      svg
    })
  }

  getColor() {
    const {
      stroke,
      colorColumn,
      colors,
      legendColumn,
      emptyBoxColor
    } = this.getConfiguredProperties()

    const colorScale = this.getMappedScaleColor(this.getFilterData(), legendColumn)

    return (d) => {
      let value = null
      if (d.hasOwnProperty(legendColumn)) {
        value = d[legendColumn]
      } else if (d.hasOwnProperty(colorColumn)) {
        value = d[colorColumn]
      } else if (d.hasOwnProperty("key")) {
        value = d["key"]
      }

      if (value === 'Empty') {
        return emptyBoxColor
      }
      return colorScale ? colorScale(value) : stroke.color || colors[0]
    }

  }

  renderLegendIfNeeded() {   
    this.renderNewLegend(this.getCellColumnData(), this.getLegendConfig(), this.getColor(), (d) => d["key"])
  }

  drawGraph({
    scale,
    brush = false,
    svg
  }) {

    const {
      onMarkClick
    } = this.props

    const {
      stroke,
      yColumn,
      xColumn,
      xAlign
    } = this.getConfiguredProperties()

    const self = this,
      box = this.getBoxSize()

      // draw heatmap cell
    const cells = svg.select('.heatmap')
      .selectAll('.heatmap-cell')
      .data(this.getFilterData(), d => d[xColumn] + d[yColumn])

    const newCells = cells.enter().append('g')
      .attr('class', 'heatmap-cell')
      .style('clip-path', `url(#clip${this.getGraphId()})`)

    newCells.append('rect')
      .style('stroke', stroke.color)
      .style('stroke-width', stroke.width)
      .style('cursor', onMarkClick ? 'pointer' : '')

    const allCells = newCells.merge(cells)

    allCells.selectAll('rect')
      .style('fill', this.getColor())
      .style('opacity', d => self.getOpacity(d))
      .attr('x', d => scale.x(d[xColumn]) - (xAlign ? 0 : box.width / 2))
      .attr('y', d => scale.y(d[yColumn]) + scale.y.bandwidth() / 2 - box.height / 2)
      .attr('height', box.height)
      .attr('width', box.width)
      .on('click', d => {
          self.handleLeave()
          onMarkClick ?  onMarkClick(d) : ''
        }
      )
      .on('mousemove', d => {
          self.hoveredDatum = d
          self.handleMove()
        }
      )
      .on('mouseleave', this.handleLeave)

    
    // Remove all remaining nodes        
    cells.exit().remove()
  }

  handleMove() {
    const { tooltip } = this.configuredProperties

    if (tooltip) {
      const x = d3.event.pageX
      const y = d3.event.pageY

      if(this.origin.x !== x  || this.origin.y !== y) {
        this.origin = { x, y }
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

  configureMinGraph() {
    const {
      data
    } = this.props

    if (!data || !data.length || !this.filterData.length)
      return

    const {
      margin,
      brush,
      xColumn,
      yColumn,
      xAlign,
      stroke,
      brushColor
    } = this.getConfiguredProperties()

    const svg   = this.getMinGraph(),
          scale = this.getScale(),
          minScale = { y: {}}

    let range, mainZoom

    svg.attr('transform', `translate(${this.getMinMarginLeft()}, ${margin.top})`)

    mainZoom = d3.scaleLinear()
      .rangeRound([this.getAvailableHeight(), 0])
      .domain([0, this.getAvailableHeight()])


    // set scale for mini heatmap graph
    minScale.y = d3.scaleBand()
      .domain(scale.y.domain())

    minScale.y.rangeRound([this.getAvailableHeight(), 0])

    range = [ 0, (this.getAvailableHeight()/this.getNestedYData().length) * brush]

    // brushing event
    this.brushing = d3.brushY()
      .extent([[0, 0], [this.getAvailableMinWidth(), this.getAvailableHeight()]])
      .on("brush end", () => {
        const scale = this.getScale(),
          originalRange = mainZoom.range()

        let [start, end] = d3.event.selection || range
        mainZoom.domain([end, start])

        scale.y.rangeRound([mainZoom(originalRange[1]), mainZoom(originalRange[0])])

        this.getGraph().select(".yAxis").call(this.getAxis().y)

        const box = this.getBoxSize()

        // re-render heatmap graph on brush end
        this.getGraph().selectAll(".heatmap-cell").selectAll("rect")
          .attr('x', d => scale.x(d[xColumn]) - (xAlign ? 0 : box.width / 2))
          .attr('y', d => scale.y(d[yColumn]) + box.height / 2 - box.height / 2)
          .attr('height', box.height)
          .attr('width', box.width)

      });

    svg.select(".brush")
      .call(this.brushing)
      .call(this.brushing.move, range)

    // removes handle to resize the brush
    svg.selectAll('.brush>.handle').remove()
    // removes crosshair cursor
    svg.selectAll('.brush>.overlay').remove()

    // draw min heatmap cells
    const cells = svg.select('.min-heatmap')
      .selectAll('.heatmap-cell')
      .data(scale.y.domain())

    const newCells = cells.enter().append('g')
      .attr('class', 'heatmap-cell')

    newCells.append('rect')
      .style('stroke', stroke.color)
      .style('stroke-width', stroke.width)

    const allCells = newCells.merge(cells)

    allCells.selectAll('rect')
      .style('fill', brushColor)
      .attr('x', 0)
      .attr('y', d => minScale.y(d))
      .attr('height', (this.getAvailableHeight()/scale.y.domain().length))
      .attr('width', this.getAvailableMinWidth())

    // Remove all remaining nodes
    cells.exit().remove()


  }

  render() {
    const {
        data,
        width,
        height
    } = this.props

    const {
      margin
    } = this.getConfiguredProperties()  

    if (!data || !data.length || !this.getFilterData().length)
      return this.renderMessage('No data to visualize')

    return (
      <div className='heatmap-graph'>
            
            { this.tooltip }

            <svg width={width} height={height}>
              <g ref={node => this.node = node}>
                <g className='graph-container' transform={ `translate(${this.getLeftMargin()},${margin.top})` }>
                    <g className='heatmap'></g>
                    <g className='tooltip-section'></g>
                    <g className='xAxis'></g>
                    <g className='yAxis'></g>
                </g>
                <g className='mini-graph-container'>
                  <g className='min-heatmap'></g>
                  <g className='brush'></g>
                </g>
                <g className='axis-title'>
                  <text className='x-axis-label' textAnchor="middle"></text>
                  <text className='y-axis-label' textAnchor="middle"></text>
                </g>
                <g className='legend'></g>
              </g>  
            </svg>
        </div>
    )
  }
}

HeatmapGraph.propTypes = {
    configuration: React.PropTypes.object,
    data: React.PropTypes.array
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

export default connect(null, actionCreators)(HeatmapGraph)

