import React from 'react';
import { GoogleMap,withGoogleMap,withScriptjs } from 'react-google-maps';

const GoogleMapsWrapper = withScriptjs(withGoogleMap(props => {
  return (
    <GoogleMap
      {...props}
      ref={props.onMapMounted}
    >
      {props.children}
    </GoogleMap>
  )
}));

GoogleMapsWrapper.defaultProps = {
  containerElement: <div style={{ height: '380px' }} />,
  loadingElement: <div style={{ height: `100%` }} />,
  mapElement: <div style={{ height: `100%` }} />,
  googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAP_API}&v=3.exp&libraries=${process.env.REACT_APP_GOOGLE_MAP_LIBRARIES}`,
  defaultZoom: Number(process.env.REACT_APP_GOOGLE_MAP_ZOOM),
  defaultCenter: { lat: Number(process.env.REACT_APP_GOOGLE_MAP_LAT), lng: Number(process.env.REACT_APP_GOOGLE_MAP_LNG) }
}

GoogleMapsWrapper.propTypes = {
  defaultZoom: React.PropTypes.number.isRequired,
  googleMapURL: React.PropTypes.string.isRequired,
  defaultCenter: React.PropTypes.shape({
    lat: React.PropTypes.number.isRequired,
    lng: React.PropTypes.number.isRequired
  })
}

export default GoogleMapsWrapper