import React from "react";

import AbstractGraph from "../AbstractGraph";
import ReactTooltip from "react-tooltip";
import columnAccessor from "../../../utils/columnAccessor";

import * as d3 from "d3";

import "./style.css";
import {properties} from "./default.config"

export default class ChordGraph extends AbstractGraph {

    constructor(props) {
        super(props, properties);
    }
    
    componentDidMount() {
        this.chordDiagram = ChordDiagram(this.svg);
        this.updateChord(this.props);

        const { tooltip } = this.getConfiguredProperties();

        const accessor = (
            (tooltip && tooltip.length === 1)
            ? columnAccessor(tooltip[0])
            : (d) => d.value
        );

        const label = (
            (tooltip && tooltip.length === 1)
            ? tooltip[0].label
            : undefined
        );

        // This function is invoked to produce the content of a tooltip.
        // Override the implementation in AbstractGraph to work with Chord data structure.
        this.getTooltipContent = () => {
            if(this.hoveredDatum) {

                const {
                    source,
                    destination,
                    sourceValue,
                    destinationValue
                } = this.hoveredDatum;

                return (
                    <div>
                        <div>
                            <strong>{`${destination} to ${source}:`}</strong>
                            <span> {accessor({ value: sourceValue})}</span>
                            { label ? <span> {label}</span>:null }
                        </div>
                        <div>
                            <strong>{`${source} to ${destination}:`}</strong>
                            <span> {accessor({ value: destinationValue})}</span>
                            { label ? <span> {label}</span>:null }
                        </div>
                    </div>
                );
            } else {
                return <div>Hover over a chord to see flow details.</div>;
            }
        }

        this.chordDiagram.onChordHover((d) => this.hoveredDatum = d );
    }

    componentWillReceiveProps(nextProps) {
        this.updateChord(nextProps);
    }

    updateChord(props) {

        const { data, width, height, onMarkClick } = this.props;
        const {
            chordWeightColumn,
            chordSourceColumn,
            chordDestinationColumn,
            outerPadding,
            arcThickness,
            padAngle,
            labelPadding,
            transitionDuration,
            defaultOpacity,
            fadedOpacity,
            colors
        } = this.getConfiguredProperties();

        // Pass values into the chord diagram via d3-style accessors.
        this.chordDiagram
            .data(data)
            .width(width)
            .height(height)
            .chordWeightColumn(chordWeightColumn)
            .chordSourceColumn(chordSourceColumn)
            .chordDestinationColumn(chordDestinationColumn)
            .outerPadding(outerPadding)
            .arcThickness(arcThickness)
            .padAngle(padAngle)
            .labelPadding(labelPadding)
            .transitionDuration(transitionDuration)
            .defaultOpacity(defaultOpacity)
            .fadedOpacity(fadedOpacity)
            .colors(colors);

        if(onMarkClick){
            this.chordDiagram.onSelectedRibbonChange((d) => {
                const selectedRibbon = this.chordDiagram.selectedRibbon();
                if(selectedRibbon) {
                    const { source, destination } = selectedRibbon;
                    onMarkClick({
                        [chordSourceColumn]: source,
                        [chordDestinationColumn]: destination
                    });
                } else {
                    onMarkClick({
                        [chordSourceColumn]: undefined,
                        [chordDestinationColumn]: undefined
                    });
                }
            });
        } else {
            this.chordDiagram.onSelectedRibbonChange(null);
        }

        // Re-render the chord diagram.
        this.chordDiagram();
    }

    render() {

        const { data, width, height } = this.props;

        if (!data || !data.length)
            return;

        return (
            <div className="pie-graph">
                {this.tooltip}
                <svg
                  width={ width }
                  height={ height }
                  ref={(svg) => this.svg = d3.select(svg)}
                  data-tip
                  data-for={ this.tooltipId }
                />
            </div>
        );
    }
}
ChordGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.object
};


// Constructor function for a Chord Diagram.
function ChordDiagram(svg){

  // Configuration parameters.
  // TODO expose all of these in the vis config.
  var width = 450,
      height = 450,
      outerPadding = 30,
      arcThickness = 20,
      padAngle = 0.07,
      labelPadding = 10,
      transitionDuration = 500,

      // Opacity values common to ribbons and arcs
      // depending on whether or not they are selected.
      defaultOpacity = 0.6,
      fadedOpacity = 0.1,

      selectedRibbon = null,
      hoveredChordGroup = null,
      data = null,
      onSelectedRibbonChangeCallback = null,
      onChordHover = null;

  // These "column" variables represent keys in the row objects of the input table.
  var chordWeightColumn,
      chordSourceColumn,
      chordDestinationColumn;

  // Accessor functions for columns.
  var weight = function (d){ return d[chordWeightColumn]; },
      source = function (d){ return d[chordSourceColumn]; },
      destination = function (d){ return d[chordDestinationColumn]; };

  // D3 Local objects for DOM-local storage.
  var

      // Stores label angles.
      angle = d3.local(),

      // Stores whether or not labels should be flipped upside-down.
      flip = d3.local(),

      // Stores whether or not this label is for a chord group
      // that is either the source or destination of the
      // selected ribbon.
      selected = d3.local();

  // DOM Elements.
  var g = svg.append("g"),
      backgroundRect = g.append("rect")
        .attr("fill", "none")
        .style("pointer-events", "all"),
      ribbonsG = g.append("g"),
      chordGroupsG = g.append("g");

  // D3 layouts, shapes and scales.
  var ribbon = d3.ribbon(),
      chord  = d3.chord(),
      color  = d3.scaleOrdinal(),
      arc    = d3.arc();

  // Compute a color scheme from d3.schemeCategory20 such that
  // distinct dark colors come first, then light colors later.
  var darkColors = d3.schemeCategory20.filter(function(d, i){
    return i % 2 - 1;
  });
  var lightColors = d3.schemeCategory20.filter(function(d, i){
    return i % 2;
  });
  var colors = darkColors.concat(lightColors);

  // Clear the selected ribbon when clicking on
  // any area other than on a ribbon.
  backgroundRect.on("mousedown", function (){
    my.selectedRibbon(null);
  });

  // Renders the given data as a chord diagram.
  function my(){

    // Use the data passed into the .data() accessor.
    if(data){

      // Set properties that may have been reconfigured via accessors.
      chord.padAngle(padAngle);
      color.range(colors);

      // Compute things that depend on width and height.
      var side = Math.min(width, height),
          outerRadius = side / 2 - outerPadding,
          innerRadius = outerRadius - arcThickness;
      ribbonsG
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
      chordGroupsG
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
      ribbon.radius(innerRadius);
      arc
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);
      backgroundRect
        .attr("width", width)
        .attr("height", height);

      // Pre-process the data and calculate the Chord Diagram layout.
      var matrix = generateMatrix(data),
          chords = chord(matrix);

      // Use alphanumerically sorted source and destination names
      // for the color scale domain for consistent colors across refreshes.
      color.domain(matrix.names.slice().sort());

      // Render the ribbons of the Chord Diagram (the connecting fibers inside the circle).
      var ribbons = ribbonsG
        .selectAll("path")
          .data(chords);
      ribbons = ribbons.enter().append("path").merge(ribbons);
      ribbons
        .attr("d", ribbon)
        .style("fill", function(d) {
          return color(matrix.names[d.source.index]);
        })
        .style("stroke", "black")
        .style("stroke-opacity", 0.2)
        .style("cursor", onSelectedRibbonChangeCallback ? "pointer" : "")
        .call(setRibbonOpacity)
        .on("mousedown", function (d){
          my.selectedRibbon(ribbonData(d));
        })
        .on("mouseover", function (d){
          if(onChordHover) onChordHover(ribbonData(d));
        })
        .on("mouseout", function (d){
          if(onChordHover) onChordHover(null);
        });
      ribbons.exit().remove();

      function ribbonData(d) {
        return {
          sourceIndex: d.source.index,
          targetIndex: d.target.index,
          source: matrix.names[d.source.index],
          destination: matrix.names[d.target.index],
          sourceValue: d.source.value,
          destinationValue: d.target.value
        };
      }

      // Scaffold the chord groups.
      var chordGroups = chordGroupsG.selectAll("g").data(chords.groups);
      var chordGroupsEnter = chordGroups.enter().append("g");
      chordGroupsEnter.append("text");
      chordGroupsEnter.append("path");
      chordGroups.exit().remove();
      chordGroups = chordGroups.merge(chordGroupsEnter);

      // Compute locals.
      chordGroups
        .each(function(group) {

          angle.set(this, (group.startAngle + group.endAngle) / 2);

          flip.set(this, angle.get(this) > Math.PI);

          selected.set(this, selectedRibbon &&
            (
              (selectedRibbon.sourceIndex === group.index) ||
              (selectedRibbon.targetIndex === group.index)
            )
          );
        })

      // Add labels
      chordGroups
        .select("text")
          .attr("transform", function() {
            return [
              "rotate(" + (angle.get(this) / Math.PI * 180 - 90) + ")",
              "translate(" + (outerRadius + labelPadding) + ")",
              flip.get(this) ? "rotate(180)" : ""
            ].join("");
          })
          .attr("text-anchor", function() {
            return flip.get(this) ? "end" : "start";
          })
          .attr("alignment-baseline", "central")
          .text(function(group) {
            return matrix.names[group.index];
          })
          .style("cursor", "default")
          .style("font-weight", function(group){
            return selected.get(this.parentNode) ? "bold" : "normal";
          })
          .call(chordGroupHover)
          .call(setChordGroupOpacity);

      // Render the chord group arcs.
      chordGroups
        .select("path")
          .attr("d", arc)
          .style("fill", function(group) {
            return color(matrix.names[group.index]);
          })
          .call(chordGroupHover)
          .call(setChordGroupOpacity);

      function setChordGroupOpacity(selection){
        selection.transition().duration(transitionDuration)
          .style("opacity", function(group){
            if(selectedRibbon){
              return selected.get(this.parentNode) ? defaultOpacity : fadedOpacity;
            } else {
              return defaultOpacity;
            }
          });
      }


      // Sets up hover interaction to highlight a chord group.
      // Used for both the arcs and the text labels.
      function chordGroupHover(selection){
        selection
          .on("mouseover", function (group){
            hoveredChordGroup = group;
            my();
          })
          .on("mouseout", function (){
            hoveredChordGroup = null;
            my();
          });
      }

      // Sets the opacity values for all ribbons.
      function setRibbonOpacity(selection){
        selection
          .transition().duration(transitionDuration)
          .style("opacity", function (d){

            // If there is a currently selected ribbon,
            if(selectedRibbon){

              // show the selected chord in full color,
              if(
                (selectedRibbon.sourceIndex === d.source.index) &&
                (selectedRibbon.targetIndex === d.target.index)
              ){
                return defaultOpacity;
              } else {

                // and show all others faded out.
                return fadedOpacity;
              }
            } else {

              // If there is no currently selected ribbon,
              // then if there is a hovered chord group,
              if(hoveredChordGroup){

                // show the ribbons connected to the hovered chord group in full color,
                if(
                  (d.source.index === hoveredChordGroup.index) ||
                  (d.target.index === hoveredChordGroup.index)
                ){
                  return defaultOpacity;
                } else {

                  // and show all others faded out.
                  return fadedOpacity;
                }
              } else {

                // Otherwise show all ribbons with slight transparency.
                return defaultOpacity;
              }
            }
          });
      }
    }
  }

  // Generates a matrix (2D array) from the given data, which is expected to
  // have fields {origin, destination, count}. The matrix data structure is required
  // for use with the D3 Chord layout.
  function generateMatrix(data){
    var indices = {},
        matrix = [],
        names = [],
        n = 0, i, j;

    function recordIndex(name){
      if( !(name in indices) ){
        indices[name] = n++;
        names.push(name);
      }
    }

    data.forEach(function (d){
      recordIndex(source(d));
      recordIndex(destination(d));
    });

    for(i = 0; i < n; i++){
      matrix.push([]);
      for(j = 0; j < n; j++){
        matrix[i].push(0);
      }
    }

    data.forEach(function (d){
      i = indices[source(d)];
      j = indices[destination(d)];

      if(chordWeightColumn){
        matrix[j][i] = weight(d);
      } else {

        // Handle the case where no weight column was specified
        // by making the chord weight fixed on both sides.
        matrix[j][i] = matrix[i][j] = 1;
      }
    });

    matrix.names = names;

    return matrix;
  }

  my.onSelectedRibbonChange = function (callback){
    onSelectedRibbonChangeCallback = callback;
  };

  // Gets or sets the selected ribbon object,
  // which can be expected to be null
  // or an object with the following fields:
  //
  //  * sourceIndex - The matrix index of the source chord group.
  //  * targetIndex - The matrix index of the destination chord group.
  //  * source - The source name (data value).
  //  * destination - The destination name (data value).
  my.selectedRibbon = function (_){
    if(typeof _ !== "undefined"){
      selectedRibbon = _;
      if(onSelectedRibbonChangeCallback) {
        onSelectedRibbonChangeCallback();
      }
      my();
    } else {
      return selectedRibbon;
    }
  };

  my.data = (_) => arguments.length ? (data = _, my) : my;
  my.width = (_) => arguments.length ? (width = _, my) : my;
  my.height = (_) => arguments.length ? (height = _, my) : my;
  my.chordWeightColumn = (_) => arguments.length ? (chordWeightColumn = _, my) : my;
  my.chordSourceColumn = (_) => arguments.length ? (chordSourceColumn = _, my) : my;
  my.chordDestinationColumn = (_) => arguments.length ? (chordDestinationColumn = _, my) : my;

  // This is kind of like a "margin" - the distance from the outer edge
  // of the circle to the nearest edge of the containing (width, height) rectangle.
  my.outerPadding = (_) => arguments.length ? (outerPadding = _, my) : my;

  // The thickness of the chord group arcs around the outer ring.
  my.arcThickness = (_) => arguments.length ? (arcThickness = _, my) : my;

  // The spacing between adjacent chord group arcs.
  my.padAngle = (_) => arguments.length ? (padAngle = _, my) : my;

  // The distance between the outer ring and the chord group labels.
  my.labelPadding = (_) => arguments.length ? (labelPadding = _, my) : my;

  // The duration (in milliseconds) of the fading transition when hovering.
  my.transitionDuration = (_) => arguments.length ? (transitionDuration = _, my) : my;

  // The opacity of the chords under normal circumstances.
  my.defaultOpacity = (_) => arguments.length ? (defaultOpacity = _, my) : my;

  // The opacity of the chords other than the highlighted one,
  // the ones that are faded into the background when hovering.
  my.fadedOpacity = (_) => arguments.length ? (fadedOpacity = _, my) : my;

  // The array of colors used for the color scale of the chord groups.
  my.colors = (_) => arguments.length ? (colors = _, my) : my;

  // A callback invoked when hovering over a chord.
  // On mouseover, an object representing the hovered chord is passed.
  // On mouseout, null is passed to the callback.
  my.onChordHover = (_) => arguments.length ? (onChordHover = _, my) : my;

  return my;
}
