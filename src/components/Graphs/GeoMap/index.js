import React from 'react'
import AbstractGraph from '../AbstractGraph'
import { connect } from 'react-redux'
import { Marker, InfoWindow, Polyline } from 'react-google-maps'
import _ from 'lodash'
import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer"

import GoogleMapsWrapper from '../../Map'
import SearchBar from "../../SearchBar"
//import {properties} from "./default.config"

class GeoMap extends AbstractGraph {

  constructor(props) {
    super(props)

    this.state = {
      data: [],
      infowindow: null,
      lines: [],
      defaultCenter: null
    }

    this.clusters = null;
    this.center = null

    this.onMapMounted         = this.onMapMounted.bind(this)
    this.handleClustererClick = this.handleClustererClick.bind(this)
    this.handleSearch         = this.handleSearch.bind(this)
    this.onBoundsChanged      = this.onBoundsChanged.bind(this);

  }

  componentWillMount() {
    this.initiate(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.data, nextProps.data))
      this.initiate(nextProps)
  }

  componentWillUnmount() {
    this.state = {
      data: [],
      infowindow: null,
      lines: [],
      defaultCenter: null
    }

    this.clusters = null;
    this.center = null
  }

  initiate(props) {
    this.setState({ data: props.data})
  }

  onMapMounted(map) {
    this.map = map
    if (!this.map)
      return

    this.map = window.google.maps
  }

  onBoundsChanged() {
    const {
      latitudeColumn,
      longitudeColumn
    } = this.getConfiguredProperties()

    const bounds = new window.google.maps.LatLngBounds()


    this.state.data.map(marker => {
      if (marker[latitudeColumn] && marker[longitudeColumn]) {
        bounds.extend(new window.google.maps.LatLng(marker[latitudeColumn], marker[longitudeColumn]));
      }
    });

    let newCenter = bounds.getCenter().toJSON()

    if (newCenter && !_.isEqual(this.center, newCenter)) {
      this.center = newCenter
      this.setState({ defaultCenter: newCenter })
    }
  }

  // toggle info window on marker click
  toggleInfoWindow = (key) => {
    this.setState({ infowindow: key || null })
  }


  // popup info window on marker's click
  infowindow(marker) {
    const {
      localityColumn,
      nameColumn,
      idColumn
    } = this.getConfiguredProperties();

    return (
      this.state.infowindow === marker[idColumn] &&
      <InfoWindow onCloseClick={() => this.toggleInfoWindow}>
        <div>{marker[nameColumn]} <br/> {marker[localityColumn]}</div>
      </InfoWindow>
    )
  }

  // call on marker click
  handleMarkerClick(marker) {
    const {
    onMarkClick
    } = this.props

    return onMarkClick ? onMarkClick(marker) : ""
  }

  // draw markers on map
  renderMarkersIfNeeded() {
    const {
      latitudeColumn,
      longitudeColumn,
      idColumn,
        nameColumn
    } = this.getConfiguredProperties();

    return (
      this.state.data.map(d => {
        if (d[latitudeColumn] && d[longitudeColumn]) {
          return <Marker
            noRedraw={false}
            options={{id: d[idColumn]}}
            key={d[idColumn]}
            position={{ lat: d[latitudeColumn], lng: d[longitudeColumn] }}
            onClick={() => this.handleMarkerClick(d)}
              //label={marker[nameColumn]}
            onMouseOver={() => this.toggleInfoWindow(d[idColumn])}
            onMouseOut={() => this.toggleInfoWindow(d[idColumn])}
            icon={`${process.env.PUBLIC_URL}/icons/icon-nsgateway-resized.png`}
          >
            {this.infowindow(d)}
          </Marker>
        }
      })
    )
  }

  handleClustererClick(clusterer) {

    let markerList = []

    clusterer.getClusters().forEach(cluster => {
      let markers = cluster.getMarkers().map(d => {
        return { [d.id]: cluster.getCenter().toJSON() }
      })
      markerList = markers ? [...markerList, ...markers] : markerList
    })

    if (!_.isEqual(this.clusters, markerList)) {
      this.clusters = markerList
      this.calculatePolylines(markerList)
    }
  }

  // calculate the lines need to be drawn to shown connected markers
  calculatePolylines(markers) {
    const {
      latitudeColumn,
      longitudeColumn,
      idColumn,
      links
    } = this.getConfiguredProperties()

    if (links && links.source && this.props[links.source].length) {

      let filterData = [];

      this.props[links.source].forEach((line, i) => {
        let destMarker = null
        let sourceMarker = null

        if (line[links.destinationColumn] && line[links.sourceColumn]) {

          // check link source and destination id's in marker list to get marker's latlng
          markers.forEach((marker, key) => {

            if (!destMarker && marker[line[links.destinationColumn]]) {
              destMarker = marker[line[links.destinationColumn]]
            }
            else if (!sourceMarker && marker[line[links.sourceColumn]]) {
              sourceMarker = marker[line[links.sourceColumn]]
            }
          })

          // if not found in bound, then find lat lng in data
          if (!destMarker && sourceMarker) {
            let destination = this.state.data.find(d => d[idColumn] === line[links.destinationColumn])

            if(destination) {
              destMarker = {
                lat: destination[latitudeColumn],
                lng: destination[longitudeColumn],
              }
            }
          }

          // if not found in bound, then find lat lng in data
          if (!sourceMarker && destMarker) {
            let source = this.state.data.find(d => d[idColumn] === line[links.sourceColumn])
            if(source) {
              sourceMarker = {
                lat: source[latitudeColumn],
                lng: source[longitudeColumn],
              }
            }
          }
        }

        if (destMarker && sourceMarker) {
          let color = line.color || "#228B22"
          if (!this.isPolylineExist(filterData, sourceMarker, destMarker)) {
            filterData.push({
              'source': { lat: sourceMarker.lat, lng: sourceMarker.lng },
              'destination': { lat: destMarker.lat, lng: destMarker.lng },
              color
            })
          }
        }
      })
      this.setState({ lines: filterData })
    }
  }

  // check line is already drawn or not
  isPolylineExist(filterData, sourceMarker, destMarker) {
    return filterData.some(function (el) {
      return ((el.source.lat === sourceMarker.lat && el.source.lng === sourceMarker.lng) && (el.destination.lat === destMarker.lat && el.destination.lng === destMarker.lng));
    });
  }

  renderPolylineIfNeeded() {

    return this.state.lines.map( (link, i) => {
      return <Polyline
        key={i}
        defaultVisible={true}
        options={{
          icons: [{
            icon: { path: 2 },
            offset: '45%'
          }],
          strokeColor: link.color,
          strokeOpacity: 1.0,
          strokeWeight: 2
        }}
        path={[
          { lat: link.source.lat, lng: link.source.lng },
          { lat: link.destination.lat, lng: link.destination.lng }
        ]}
      />
    })
  }

  // handle response after searching
  handleSearch(data) {
    this.setState({data})
  }

  renderSearchBarIfNeeded() {
    const {
        searchBar,
        filters
    } = this.getConfiguredProperties()

    if(searchBar === false)
       return

    return (
      <SearchBar
        data={this.props.data}
        options={filters}
        handleSearch={this.handleSearch}
      />
    );
  }

  render() {
    const {
      data,
      height
    } = this.props

    const {
        searchBar
    } = this.getConfiguredProperties()

    if (!data || !data.length)
      return this.renderMessage('No data to visualize')


    let mapHeight = height,
        defaultCenter = {
          lat: Number(process.env.REACT_APP_GOOGLE_MAP_LAT),
          lng: Number(process.env.REACT_APP_GOOGLE_MAP_LNG)
        }

    let defaultLatLng = this.state.defaultCenter ? this.state.defaultCenter : defaultCenter;

    if(searchBar !== false) {
      mapHeight -= 69
    }

    return (
      <div>
        {this.renderSearchBarIfNeeded()}
        <GoogleMapsWrapper
          onBoundsChanged={this.onBoundsChanged}
          center={defaultLatLng}
          onMapMounted={this.onMapMounted}
          containerElement={<div style={{ height: mapHeight }} />}>
          <MarkerClusterer
            ignoreHidden={false}
            averageCenter
            gridSize={60}
            onClusteringEnd={ this.handleClustererClick}
            //styles={properties.clusterStyle}
          >
            {this.renderMarkersIfNeeded()}
            { this.renderPolylineIfNeeded()}
          </MarkerClusterer>
        </GoogleMapsWrapper>
      </div>
    )
  }
}

GeoMap.propTypes = {
  data: React.PropTypes.array
};

export default connect(null, null)(GeoMap);
