import React from "react";
import AbstractGraph from "../AbstractGraph";
import * as d3 from "d3";
import "./sankey.js"
import "./style.css";
import {properties} from "./default.config";
import { CardOverlay } from "../../CardOverlay"; 

class SankeyGraph extends AbstractGraph {

  constructor(props) {
    super(props, properties);
      this.sankey = d3.sankey();
      this.filterDatas = {};
  }

  componentWillMount() {
    this.initiate(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props !== nextProps) {
      this.initiate(nextProps);
    }
  }

  componentDidMount() {
    this.createSankeyChart()
  }
    
  componentDidUpdate() {
    this.createSankeyChart()
  }

  // get sankey chart object.
  getSankey() {
    return this.sankey;
  }
    
  //get formatted nodes data.
  getNodes() {
    return this.filterDatas.nodes;
  }
    
  // get formatted links data.
  getLinks() {
    return this.filterDatas.links;
  }
    
  // get parent node (svg).
  getParentNode() {
    return this.node;
  }
    
  // get formatted function to format value.
  getFormat() {
    const {
      valueFormat
    } = this.getConfiguredProperties();
    
    return d => d3.format(valueFormat)(d);   
  }

  // function to set initial data to render sankey chart
  initiate(props) {
    const {
      data
    } = props;

    if (!data || !data.length)
      return;


    this.dataError = false;
    if (this.checkData(data)) {
      this.dataError = true;
    } else {
      this.parseData(props);
      this.setProperties(props);
    }
  }

  // manipulate data in sankey chart format
  parseData(props) {
    const {
      data
    } = props;    

    const {
      sourceColumn,
      targetColumn,
      valueColumn
    } = this.getConfiguredProperties();

    let nodes = [], links = [];

    data.forEach((d) => {
      nodes.push(...[d[sourceColumn], d[targetColumn]]);
      links.push({ 
        "source": d[sourceColumn],
        "target": d[targetColumn],
        "value": +d[valueColumn] }
      );
    });
    
    nodes = nodes.filter( (item, i, ar) => ar.indexOf(item) === i );

    // loop through each link replacing the text with its index from node
    links.forEach((d, i) => {
      links[i][sourceColumn] = nodes.indexOf(links[i][sourceColumn]);
      links[i][targetColumn] = nodes.indexOf(links[i][targetColumn]);
    });

    nodes = nodes.map( (d) => {
      return { name: d };
    });

    this.filterDatas = {"nodes" : nodes, "links" : links};
  }

  // set the data and properties of the sankey chart. 
  setProperties(props) {
    const {
      width,
      height
    } = props;

    const {
      margin
    } = this.getConfiguredProperties();

    const 
      availableWidth = width - margin.left - margin.right,
      availableHeight = height - margin.top - margin.bottom,
      nodeWidth = (availableWidth/ this.getNodes().length) * 0.1;

    // Set the sankey diagram properties.
    let sankey = this.getSankey();

    sankey
      .nodeWidth(nodeWidth)
      .nodePadding(properties.nodePadding)
      .size([availableWidth, availableHeight]);

    sankey
      .nodes(this.getNodes())
      .links(this.getLinks())
      .layout(properties.layout);
  }

  // Create sankey chart.
  createSankeyChart() {
    if(this.dataError)
      return;

    // append the g object to the svg object of the page
    var node = d3.select(this.getParentNode());

    // Create links for chart
    this.generateLinks(node); 

    // Create path for chart
    this.generateNodes(node);
  }

  // Add links in chart.
  generateLinks(parentLink) {
    const {
      valueColumnLabel
    } = this.getConfiguredProperties();

    // add in the links
    const links = parentLink.select(".linkContainer").selectAll(".link")
      .data(this.getLinks(), d => d.source.name + "-" + d.target.name );

    const newLinks = links.enter().append("path")
      .attr("class", "link");

    newLinks.append("title");
    
    const allLinks = newLinks.merge(links);

    allLinks
      .style("stroke-width", d => Math.max(1, d.dy) )
      .sort( (a, b) => b.dy - a.dy )
      .attr("d", this.getSankey().link())

    // add the link titles
    allLinks.select("title")
      .text((d) =>
        `${d.source.name} -> ${d.target.name} \n${valueColumnLabel} : ${this.getFormat()(d.value)}`
      ) 

    // Remove all remaining links
    links.exit().remove();
  }

  // Add paths in chart.
  generateNodes(parentNode) {
    const {
      width
    } = this.props;

    const {
      valueColumnLabel
    } = this.getConfiguredProperties();

    const color = d3.scaleOrdinal(properties.colors);

    // add in the nodes
    var nodes = parentNode.select(".nodeContainer").selectAll(".node")
      .data(this.getNodes(), d => d.name);

    const newNodes = nodes.enter().append("g")
      .attr("class", "node");

    newNodes.append("rect")
      .style("fill", d => d.color = color(d.name.replace(/ .*/, "")))
      .style("stroke", d => d3.rgb(d.color).darker(2) )
      .append("title");
    
    newNodes.append("text")
      .attr("fill", "#423838");

    const allNodes = newNodes.merge(nodes);

    allNodes.attr("transform", d => `translate(${d.x}, ${d.y})` );

    // add the rectangles for the nodes
    allNodes.select("rect")
      .attr("height", d => d.dy )
      .attr("width", this.getSankey().nodeWidth())
     .select("title")
      .text( d => 
        `${d.name} \n${valueColumnLabel} : ${this.getFormat()(d.value)}` );

    // add in the title for the nodes
    allNodes.select("text")
      .attr("x", "-6")
      .attr("y", d =>  d.dy / 2 )
      .text( d => d.name )
      .attr("text-anchor", "end")
     .filter( d => d.x < width / 2 )
      .attr("x", 6 + this.getSankey().nodeWidth())
      .attr("text-anchor", "start");

    // Remove all remaining nodes        
    nodes.exit().remove();
  }

  checkData(data) {
    const {
      sourceColumn,
      targetColumn,
    } = this.getConfiguredProperties();

    let result =  data.filter( (item, i, ar) =>
      ar.find( d => d[sourceColumn] === item[targetColumn] && d[targetColumn] === item[sourceColumn])
    );
    return result.length ? true : false;
  }

  render() {
    const {
      data,
      width,
      height
    } = this.props;

    const {
      margin
    } = this.getConfiguredProperties();

    if (!data || !data.length)
      return;

    if(this.dataError)
     
      return (
        <CardOverlay
          overlayStyle={{"textAlign" : "center"}}
          textStyle={{"top": "50%","transform": "translateY(-50%)"}}
          text="We have found cyclic nodes. Please review your response"
        />
      );

    return (
      <div id="sankey-graph">
        <svg width={width} height={height}>
          <g
            transform={ `translate(${margin.left},${margin.top})`}
            ref={node => this.node = node}>
              <g className="linkContainer"></g>
              <g className="nodeContainer"></g>
          </g>
        </svg> 
      </div>
    );
  }
}

SankeyGraph.propTypes = {
  configuration: React.PropTypes.object
};

export default SankeyGraph;