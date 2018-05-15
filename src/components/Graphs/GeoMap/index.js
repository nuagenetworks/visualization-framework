import React from 'react'
import AbstractGraph from '../AbstractGraph'
import { connect } from 'react-redux'
import { Marker, InfoWindow, Polyline } from 'react-google-maps'
import _ from 'lodash'
import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer"

import GoogleMapsWrapper from '../../Map'
import SearchBar from "../../SearchBar"
import { getIconPath } from '../../../utils/helpers'
import {properties} from './default.config'
import { theme } from '../../../theme'

class GeoMap extends AbstractGraph {

  constructor(props) {

    super(props, properties)

    this.map = null
    this.clusterCenter = null

    this.state = {
      data: [],
      infowindow: {
        data: null,
        position: null
      },
      lines: [],
      defaultCenter: null,
      spiderifyMarkers: [],
      spiderifyLines: []
    }

    this.clusters = null;
    this.center = null

    this.onMapMounted         = this.onMapMounted.bind(this)
    this.handleClusterClick   = this.handleClusterClick.bind(this)
    this.handleClustererEnd   = this.handleClustererEnd.bind(this)
    this.handleSearch         = this.handleSearch.bind(this)
    this.onBoundsChanged      = this.onBoundsChanged.bind(this)
    this.onZoomChanged        = this.onZoomChanged.bind(this)
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
    if (!map)
      return

    this.map = map
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
  toggleInfoWindow = (data = null, position = null) => {
    if(!data || !_.isEqual(position, this.state.infowindow.position)) {
      this.setState({
        infowindow: {
          data,
          position
        }
      })
    }
  }

  // popup info window on marker's click
  renderInfowindow() {
    const {
      localityColumn,
      nameColumn,
      idColumn
    } = this.getConfiguredProperties();

    let { data, position } = this.state.infowindow

    return (
      data && (
        <InfoWindow
          position={position}
          options={{
            pixelOffset: new window.google.maps.Size(0,-25)
          }}
          onCloseClick={() => this.toggleInfoWindow}>
          <div>{data[nameColumn]} <br/> {data[localityColumn]}</div>
        </InfoWindow>
      )
    )
  }

  // call on marker click
  handleMarkerClick(data) {
    const {
    onMarkClick
    } = this.props

    return onMarkClick ? onMarkClick(data) : ""
  }

  // draw markers on map
  renderMarkersIfNeeded() {
    const {
      latitudeColumn,
      longitudeColumn
    } = this.getConfiguredProperties()

    return this.state.data.map(d => {
        if (d[latitudeColumn] && d[longitudeColumn]) {
          return this.drawMarker({
            data: {...d},
            position: {
              lat: d[latitudeColumn],
              lng: d[longitudeColumn]
            }
          })
        }
      })
  }

  drawMarker({ data, position, labelOrigin = null}) {
    const {
      idColumn,
      markerIcon
    } = this.getConfiguredProperties()

    return (
      <Marker
        noRedraw={false}
        options={{
          id: data[idColumn],
          data
        }}
        key={data[idColumn]}
        position={position}
        onClick={() => this.handleMarkerClick(data)}
        onMouseOver={() => this.toggleInfoWindow(data, position)}
        onMouseOut={() => this.toggleInfoWindow()}
        icon={{
          url: getIconPath(markerIcon),
          labelOrigin,
          anchor: labelOrigin
        }}
      />
    )
  }


  handleClusterClick(cluster) {
    const {
      maxZoom
    } = this.getConfiguredProperties()

    let zoom = this.map.getZoom()

    //Tracking Zoom of the Cluster, when it clicked and not at finalzoom,
    //Used to go back to that stage in case of Zoom out from MAX level
    if(zoom < maxZoom) {
      this.clusterZoom = this.map.getZoom()
    }

    let markers = cluster.getMarkers()
    if(zoom >= maxZoom  && markers.length > 1) {

      // check the cluster that is already expanded or not, if yes than collapse the clicked cluster
      if(this.clusterCenter && _.isEqual(this.clusterCenter.toJSON(), cluster.getCenter().toJSON())) {

        this.clusterCenter = null
        this.setState({
          spiderifyLines: [],
          spiderifyMarkers: []
        })

      } else {

        this.clusterCenter = cluster.getCenter()

        let projection = this.map.getProjection(),
        centerPoint = projection.fromLatLngToPoint(this.clusterCenter)

        let radius = 0.0002,
        step = markers.length < 10 ? markers.length : 10, counter = 0, remaining = markers.length,
        theta = ((Math.PI*2) / step)

        let spiderifyMarkers = markers.map((marker, i) => {
          counter++;

          let angle = (theta * counter),
          x =  (radius * Math.cos(angle)) + centerPoint.x,
          y = (radius * Math.sin(angle)) + centerPoint.y

          const point = projection.fromPointToLatLng(new window.google.maps.Point(x, y)).toJSON()

          if(counter === step) {
            remaining -= step;
            step += 5;
            if(remaining < step)
              step = remaining;

            counter = 0;
            radius += 0.00012;
            theta = ((Math.PI*2) / step)
          }

          return this.drawMarker({
            data: Object.assign({}, marker.data, {spiderify: true}),
            position: point,
            labelOrigin: new window.google.maps.Point(13, 13),
          })
        })

        const spiderifyLines = spiderifyMarkers.map( (marker, i) => {
          return (
            <Polyline
              key={i}
              defaultVisible={true}
              options={{
                strokeColor: theme.palette.orangeLightColor,
                strokeOpacity: 1.0,
                strokeWeight: 1.2
              }}
              path={[
                this.clusterCenter.toJSON(),
                marker.props.position
              ]}
            />
          )
        })

        this.setState({spiderifyMarkers, spiderifyLines})
      }
    }
  }

  handleClustererEnd(clusterer) {

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
          let color = line.color || theme.palette.redColor
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
          strokeWeight: 1.5
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

  onZoomChanged() {
    const {
      maxZoom
    } = this.getConfiguredProperties()

    let zoom = this.map.getZoom()

    if(zoom < maxZoom  && this.state.spiderifyLines.length) {
      this.setState({
        spiderifyLines: [],
        spiderifyMarkers: []
      })

      //IN Case of Zoomout going back to initial zoom when cluster has been clicked
      if(this.clusterZoom) {
        //this.map.setZoom(this.clusterZoom)
      }

      this.clusterZoom = null;
    }
  }

  render() {
    const {
      data,
      height
    } = this.props

    const {
        searchBar,
        maxZoom,
        minZoom,
        mapStyles
    } = this.getConfiguredProperties()

    if (!data || !data.length)
      return this.renderMessage('No data to visualize')


    let mapHeight = height,
        defaultCenter = {
          lat: Number(process.env.REACT_APP_GOOGLE_MAP_LAT),
          lng: Number(process.env.REACT_APP_GOOGLE_MAP_LNG)
        }

    const defaultLatLng = this.state.defaultCenter ? this.state.defaultCenter : defaultCenter;

    if(searchBar !== false) {
      mapHeight -= 69
    }

    return (
      <div>
        {this.renderSearchBarIfNeeded()}
        <GoogleMapsWrapper
          onBoundsChanged={this.onBoundsChanged}
          onZoomChanged={this.onZoomChanged}
          center={defaultLatLng}
          options={{
            maxZoom,
            minZoom,
            mapTypeControlOptions: {
              mapTypeIds: ['terrain']
            },
            streetViewControl:false,
            mapTypeControl: false,
            styles: mapStyles
           }}
          onMapMounted={this.onMapMounted}
          containerElement={<div style={{ height: mapHeight }} />}>
          { this.state.spiderifyLines }
          { this.state.spiderifyMarkers }
          <MarkerClusterer
            ignoreHidden={false}
            averageCenter
            gridSize={60}
            onClusteringEnd={ this.handleClustererEnd}
            onClick={this.handleClusterClick}
          >
            { this.renderMarkersIfNeeded() }
            { this.renderPolylineIfNeeded() }
          </MarkerClusterer>

          { this.renderInfowindow() }
        </GoogleMapsWrapper>
      </div>
    )
  }
}

GeoMap.propTypes = {
  data: React.PropTypes.array
};

export default connect(null, null)(GeoMap);
