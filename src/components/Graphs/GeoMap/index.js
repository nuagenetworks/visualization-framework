import React from 'react'
import AbstractGraph from '../AbstractGraph'
import { connect } from 'react-redux'
import { Marker, InfoWindow, Polyline } from 'react-google-maps'

import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer"
import GoogleMapsWrapper from '../../Map'


class GeoMap extends AbstractGraph {

  constructor(props) {
    super(props)

    this.state = {
      markers: [],
      infowindow: null
    }

    this.onMapMounted = this.onMapMounted.bind(this)
  }

  componentWillMount() {
    this.initiate(this.props)
  }

  componentWillReceiveProps(nextProps) {

    if (JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data)) {
      this.initiate(nextProps)
    }
  }
  componentDidMount() {
  }


  onMapMounted(map) {
    this.map = map
    if (!this.map)
      return

    this.map = window.google.maps
  }

  initiate(props) {
    this.setState({ markers: props.data })
  }

  // toggle info window on marker click
  toggleInfoWindow = (key) => {
    this.setState({ infowindow: key || null })
  }

  // popup window display on marker's click
  infowindow(marker) {
    const {
      nameColumn,
      idColumn
    } = this.getConfiguredProperties();

    return (
      this.state.infowindow === marker[idColumn] &&
      <InfoWindow onCloseClick={() => this.toggleInfoWindow}>
        <div>{marker[nameColumn]}</div>
      </InfoWindow>
    )
  }

  // Used to draw markers on map
  getMarkers() {
    const {
      latitudeColumn,
      longitudeColumn,
      idColumn
    } = this.getConfiguredProperties();

    return (
      this.state.markers.map(marker => {
        if (marker[latitudeColumn] && marker[longitudeColumn]) {
          return <Marker
            key={marker[idColumn]}
            position={{ lat: marker[latitudeColumn], lng: marker[longitudeColumn] }}
            onClick={() => this.toggleInfoWindow(marker[idColumn])}
          >
            {this.infowindow(marker)}
          </Marker>
        }
      })
    )
  }

  // draw line (polyline) to connect markers
  getPolyLine() {
    const {
      latitudeColumn,
      longitudeColumn,
      idColumn
    } = this.getConfiguredProperties();

    return (
      this.state.markers.map(marker => {
        if (marker[latitudeColumn] && marker[longitudeColumn] && marker.links) {

          return marker.links.map(link => {
            let destMarker = this.state.markers.find(d => d[idColumn] === link.id)
            let color = link.color || '#FF0000'

            if (destMarker) {

              return <Polyline
                defaultVisible={true}
                options={{
                  icons: [{
                    icon: { path: 2 },
                    offset: '100%'
                  }],
                  strokeColor: color,
                  strokeOpacity: 1.0,
                  strokeWeight: 2
                }}
                defaultPath={[
                  { lat: marker[latitudeColumn], lng: marker[longitudeColumn] },
                  { lat: destMarker[latitudeColumn], lng: destMarker[longitudeColumn] }
                ]}
              />
            }
          })
        }
      })
    )
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
          averageCenter
          enableRetinaIcons
          gridSize={60}
        >
          {this.getMarkers()}
          {this.getPolyLine()}
        </MarkerClusterer>
      </GoogleMapsWrapper>
    )
  }
}

GeoMap.propTypes = {
  data: React.PropTypes.array
};

export default connect(null, null)(GeoMap);
