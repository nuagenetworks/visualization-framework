import React from 'react'
import AbstractGraph from '../AbstractGraph'
import { connect } from 'react-redux'
import { Marker, InfoWindow, Polyline } from 'react-google-maps'

import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer"
import GoogleMapsWrapper from '../../Map'


class GeoMap extends AbstractGraph {

  constructor(props) {
    super(props)

    this.state =  {
      markers: [],
      infowindow: null
    }

    this.onMapMounted = this.onMapMounted.bind(this)
  }

  componentWillMount() {
    this.initiate(this.props)
  }

  componentWillReceiveProps(nextProps) {

    if(JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data)) {
      this.initiate(nextProps)
    }
  }
  componentDidMount() {
  }


  onMapMounted(map) {
    this.map = map
    if(!this.map)
      return

    this.map =  window.google.maps
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
          'name': d[nameColumn],
          'links': d.links || []
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

  // draw line (polyline)  to connect markers
  getPolyLine() {
    return (
      this.state.markers.map( marker => {
        return marker.links.map(link => {

          let destMarker = this.state.markers.find( d => d.id === link.id )
          let color = link.color || '#FF0000'

          if(destMarker) {
            return <Polyline
              defaultVisible={true}
              options={{
                icons: [{
                  icon: {path: 2},
                  offset: '100%'
              }],
                strokeColor: color,
                strokeOpacity: 1.0,
                strokeWeight: 2}}
                defaultPath={[
                {lat: marker.lat, lng: marker.lng},
                {lat: destMarker.lat, lng: destMarker.lng}
              ]}
            />
          }
        })
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

export default connect ( null, null) (GeoMap);
