import React from 'react'
import AbstractGraph from '../AbstractGraph'
import { connect } from 'react-redux'
import { Marker, InfoWindow, Polyline } from 'react-google-maps'
import _ from 'lodash'

import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer"
import GoogleMapsWrapper from '../../Map'

class GeoMap extends AbstractGraph {

  constructor(props) {
    super(props)

    this.state = {
      infowindow: null,
      lines: []
    }

    this.clusters = null;

    this.onMapMounted = this.onMapMounted.bind(this)
    this.handleClustererClick = this.handleClustererClick.bind(this)
  }

  onMapMounted(map) {
    this.map = map
    if (!this.map)
      return

    this.map = window.google.maps
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
  getMarkers() {

    const {
      data
    } = this.props

    const {
      latitudeColumn,
      longitudeColumn,
      idColumn
    } = this.getConfiguredProperties();

    return (
      data.map(marker => {
        if (marker[latitudeColumn] && marker[longitudeColumn]) {
          return <Marker
            options={{id: marker[idColumn]}}
            key={marker[idColumn]}
            position={{ lat: marker[latitudeColumn], lng: marker[longitudeColumn] }}
            onClick={() => this.toggleInfoWindow(marker)}
          >
            {this.infowindow(marker)}
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
      data
    } = this.props

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
            let destination = data.find(d => d[idColumn] === line[links.destinationColumn])
            destMarker = {
              lat: destination[latitudeColumn],
              lng: destination[longitudeColumn],
            }
          }

          // if not found in bound, then find lat lng in data
          if (!sourceMarker && destMarker) {
            let source = data.find(d => d[idColumn] === line[links.sourceColumn])
            sourceMarker = {
              lat: source[latitudeColumn],
              lng: source[longitudeColumn],
            }
          }
        }

        if (destMarker && sourceMarker) {
          let color = line.color || "#000"
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

  renderPolyline() {

    return this.state.lines.map( (link, i) => {
      return <Polyline
        key={i}
        defaultVisible={true}
        options={{
          icons: [{
            icon: { path: 2 },
            offset: '100%'
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

  render() {
    const {
      data,
      height
    } = this.props

    if (!data || !data.length)
      return this.renderMessage('No data to visualize')

    return (
      <GoogleMapsWrapper
        onMapMounted={this.onMapMounted}
        containerElement={<div style={{ height }} />}>
        <MarkerClusterer
          ignoreHidden={false}
          averageCenter
          enableRetinaIcons
          gridSize={60}
          onClusteringEnd={ this.handleClustererClick}
        >
          {this.getMarkers()}
          { this.renderPolyline()}
        </MarkerClusterer>
      </GoogleMapsWrapper>
    )
  }
}

GeoMap.propTypes = {
  data: React.PropTypes.array
};

export default connect(null, null)(GeoMap);
