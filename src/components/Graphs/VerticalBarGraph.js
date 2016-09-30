import React from "react";
import ReactDOM from "react-dom";

import CircularProgress from "material-ui/CircularProgress";
import tabify from "../../utils/tabify";
import * as d3 from "d3";
import ReactiveModel from "reactive-model";
import "./BarGraph.css";

export default class VerticalBarGraph extends React.Component {

    componentDidMount(){
        this.div = ReactDOM.findDOMNode(this.refs.div);
        const svg = d3.select(this.div).append("svg")
        this.barChart = BarChart()
          .svg(svg)
          .marginTop(10)
          .marginBottom(52)
          .marginLeft(57)
          .marginRight(40)
          .xAxisLabelOffset(10)
          .yAxisLabelOffset(20)
          .yAxisTickSpacing(121);

        // TODO figure out a cleaner way here.
        this.shouldComponentUpdate(this.props);
    }

    shouldComponentUpdate(nextProps){
        const { response }  = nextProps;

        // TODO figure out how to get rid of this constant.
        // Maybe use flexbox to get proper height from clientHeight?
        const bannerHeight = 64;

        if(response){
            const data = tabify(response.results);
            this.barChart
              .width(this.div.clientWidth)
              .height(this.div.clientHeight - bannerHeight)
              .xColumn("key")
              .yColumn("Sum of MB")
              .data(data)
              .digest();
            console.log(JSON.stringify( barChart() , null, 2));
        }

        // Manage the DOM with D3, prevent React from rendering.
        return false;
    }

    render() {
        return (
            <div className="bar-graph" ref="div" />
        );
    }
}

VerticalBarGraph.propTypes = {
  title: React.PropTypes.string,
  response: React.PropTypes.object
};


var transitionDuration = 800;

// Resizes the SVG container.
function SVG(my){
  my("svg")
    ("width", 100)
    ("height", 100)
  
    ("svg-width", function (svg, width){
      svg.attr("width", width);
    }, "svg, width")
  
    ("svg-height", function (svg, height){
      svg.attr("height", height);
    }, "svg, height");
}

// Encapsulates the margin convention.
function Margin(my){
  
  my("marginTop", 50)
    ("marginBottom", 50)
    ("marginLeft", 50)
    ("marginRight", 50)
  
    ("innerWidth", function (width, marginLeft, marginRight){
      return width - marginLeft - marginRight;
    }, "width, marginLeft, marginRight")

    ("innerHeight", function (height, marginTop, marginBottom){
      return height - marginTop - marginBottom;
    }, "height, marginTop, marginBottom")

    ("g", function (svg){
      return svg.append("g");
    }, "svg")

    ("g-transform", function (g, marginLeft, marginTop){
      g.attr("transform", "translate(" + marginLeft + "," + marginTop + ")");
    }, "g, marginLeft, marginTop");
  
}

// Adds the "data" property.
function Data(my){
  my("data");
}

// Adds a column and accessor for the given column name.
function Column(my, name){
  my(name + "Column")
    (name + "Accessor", function (column){
      return function (d){ return d[column]; };
    }, name + "Column");
}

// Sets up a linear scale with the given name.
function ScaleLinear(my, name){
  var scale = d3.scaleLinear();
  
  my(name + "ScaleDomain", function (data, accessor){
    return [0, d3.max(data, accessor)];
  }, "data, " + name + "Accessor");
  
  if(name === "x"){
    my("xScaleRange", function (innerWidth){
      return [0, innerWidth];
    }, "innerWidth");
  } else if(name === "y"){
    my("yScaleRange", function (innerHeight){
      return [innerHeight, 0];
    }, "innerHeight");
  }
    
  my(name + "Scale", function(domain, range){
      return scale
        .domain(domain)
        .range(range)
        .nice();
    }, name + "ScaleDomain, " + name + "ScaleRange")

    (name + "Scaled", function(scale, accessor){
      return function (d){
        return scale(accessor(d));
      };
    }, name + "Scale, " + name + "Accessor");
}

// Sets up a Band ordinal scale with the given name.
function ScaleBand(my, name){
  var scale = d3.scaleBand();
  
  my(name + "ScaleDomain", function (data, accessor){
    return data.map(accessor);
  }, "data, " + name + "Accessor");
  
  my(name + "ScalePadding", 0.1);
  
  if(name === "x"){
    my("xScaleRange", function (innerWidth){
      return [0, innerWidth];
    }, "innerWidth");
  } else if(name === "y"){
    my("yScaleRange", function (innerHeight){
      return [innerHeight, 0];
    }, "innerHeight");
  }
  
  my(name + "Scale", function(domain, range, padding){
      return scale
        .padding(padding)
        .domain(domain)
        .range(range);
    }, name + "ScaleDomain, " + name + "ScaleRange, " + name + "ScalePadding")

    (name + "Scaled", function(scale, accessor){
      return function (d){
        return scale(accessor(d));
      };
    }, name + "Scale, " + name + "Accessor");
}

// Sets up an axis with the given name ("x" or "y")
function Axis(my, name){

  var axisLengthProperty;
  var tickSizeProperty;
  var axis;

  // Approximate number of pixels between ticks.
  my(name + "AxisTickSpacing", 70)

  
    (name + "AxisG", function (g){
      return g.append("g").attr("class", name + " axis");
    }, "g");
  
  if(name === "x"){
    axisLengthProperty = "innerWidth";
    tickSizeProperty = "innerHeight";
    axis = d3.axisBottom();

    my(function(xAxisG, innerHeight){
      xAxisG.attr("transform", "translate(0," + innerHeight + ")");
    }, "xAxisG, innerHeight");

  } else if(name === "y"){
    axisLengthProperty = "innerHeight";
    tickSizeProperty = "innerWidth";
    axis = d3.axisLeft();
  }

  my(name + "AxisTicks", function (xAxisTickSpacing, axisLength){
      return axisLength / xAxisTickSpacing;
    }, name + "AxisTickSpacing," + axisLengthProperty)
          
    // If true, tick marks will span the entire innerWidth or innerHeight.
    (name + "AxisTickFullSpan", true)

    (name + "Axis", function(ticks, scale, tickSize, tickFullSpan){
      return axis
        .scale(scale)
        .tickSize(tickFullSpan? -tickSize : 10)
        .ticks(ticks);
    }, [
          name + "AxisTicks",
          name + "Scale",
          tickSizeProperty,
      name + "AxisTickFullSpan"
    ])

    (function(axisG, axis){
      axis(axisG.transition().duration(transitionDuration));
    }, name + "AxisG, " + name + "Axis");
  
}

function AxisLabel(my, name){
  my(name + "AxisLabelOffset", 15)

    (name + "AxisLabel", function (svg){
      return svg.append("text")
        .attr("class", name + " axis-label")
        .style("text-anchor", "middle");
    }, "svg")

    my(function (axisLabel, column){
      axisLabel.text(column);
    }, name + "AxisLabel," + name + "Column");

  if(name === "x"){

    my(function (axisLabel, marginLeft, innerWidth){
        axisLabel.attr("x", marginLeft + innerWidth / 2);
      }, "xAxisLabel, marginLeft, innerWidth")

      (function (axisLabel, height, offset){
        axisLabel.attr("y", height - offset);
      }, "xAxisLabel, height, xAxisLabelOffset");

  } else if(name === "y"){
    my(function (label, offset, innerHeight, marginTop){
      label.attr("transform", [
        "translate(",
          offset,
        ",",
          marginTop + innerHeight / 2,
        ") rotate(-90)"
      ].join(""));
    }, "yAxisLabel, yAxisLabelOffset, innerHeight, marginTop");
  }
}

function BarChartMarks(my){

  my("circleG", function (g){
      return g.append("g");
    }, "g")
  
    ("barColor", "black")

    (function (circleG, data, xScale, xScaled, yScaled, barColor, innerHeight){
      var rect = circleG.selectAll("rect").data(data);
      rect.exit().remove();
      rect.enter().append("rect")
          
        .merge(rect)
          .attr("fill", barColor)
          .attr("x", xScaled)
          .attr("y", yScaled)
          .attr("width", xScale.bandwidth)
          .attr("height", function (d){ return innerHeight - yScaled(d); });
          
    }, "circleG, data, xScale, xScaled, yScaled, barColor, innerHeight");
}

function BarChart(){
  
  return ReactiveModel()
    .call(SVG)
    .call(Margin)
    .call(Data)
    .call(Column, "x")
    .call(Column, "y")
    .call(ScaleBand, "x")
    .call(ScaleLinear, "y")
    .call(BarChartMarks)
    .call(Axis, "x")
    .call(Axis, "y")
      .xAxisTickFullSpan(false)
    .call(AxisLabel, "x")
    .call(AxisLabel, "y");
}
