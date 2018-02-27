import React from 'react'
import AbstractGraph from '../AbstractGraph'
import { connect } from 'react-redux'
import { Marker, InfoWindow } from 'react-google-maps'

import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer"
import GoogleMapsWrapper from '../../Map'


class GeoMap extends AbstractGraph {

  constructor(props) {
    super(props)

    this.state =  {
      markers: [],
      infowindow: null
    }
  }

  componentWillMount() {
    this.initiate(this.props)
  }

  componentWillReceiveProps(nextProps) {

    if(JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data)) {
      this.initiate(nextProps)
    }
  }

  initiate(props) {
    const {
      latitudeColumn,
      longitudeColumn,
      nameColumn,
      idColumn
    } = this.getConfiguredProperties();

    let filterData = []
    props.data.forEach((d, i) => {
      if(d[latitudeColumn] && d[longitudeColumn]) {
        filterData.push({
          'id': d[idColumn],
          'lat': d[latitudeColumn],
          'lng': d[longitudeColumn],
          'name': d[nameColumn]
        })
      }
    })
    
    this.setState({ markers: filterData })
  }

  // toggle info window on marker click
  toggleInfoWindow = (key) => {
    this.setState({ infowindow: key || null })
  }

  // popup window display on marker's click
  infowindow(marker) {
    return (
      this.state.infowindow === marker.id &&
      <InfoWindow onCloseClick={ () => this.toggleInfoWindow}>
        <div>{marker.name}</div>
      </InfoWindow>
    )
  }

  // Used to draw markers on map
  getMarkers() {
    return (
      this.state.markers.map( marker => (
        <Marker
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
          onClick={ () => this.toggleInfoWindow(marker.id)}
        >
          {this.infowindow(marker)}
        </Marker>
      ))
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
            containerElement={<div style={{ height }} />}>
            <MarkerClusterer
              averageCenter
              enableRetinaIcons
              gridSize={60}
            >
              {this.getMarkers()}
            </MarkerClusterer>
          </GoogleMapsWrapper>
        )
  }
}

GeoMap.propTypes = {
    data: React.PropTypes.array
};

export default connect ( null, null) (GeoMap);