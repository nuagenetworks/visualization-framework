import React from 'react';
import { GoogleMap,withGoogleMap,withScriptjs } from 'react-google-maps';
import { connect } from 'react-redux';
import {ActionKeyStore} from "../../configs/nuage/vsd/redux/actions";

const GoogleMapsWrapper = withScriptjs(withGoogleMap(props => {
  const { googleMapsAPIKey } = props;
  const googleMapURL = `https://maps.googleapis.com/maps/api/js?key=${googleMapsAPIKey}&v=3.exp&libraries=${process.env.REACT_APP_GOOGLE_MAP_LIBRARIES}`
  return (
    <GoogleMap
      {...props}
      googleMapURL={googleMapURL}
      ref={props.onMapMounted}
    >
      {props.children}
    </GoogleMap>
  )
}));

GoogleMapsWrapper.defaultProps = {
  options: {streetViewControl:false},
  containerElement: <div style={{ height: '380px' }} />,
  loadingElement: <div style={{ height: `100%` }} />,
  mapElement: <div style={{ height: `100%` }} />,
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

export default connect(state => {
    const userContext = state.VSD.get(ActionKeyStore.USER_CONTEXT)
    return {
      googleMapsAPIKey: (userContext && userContext.googleMapsAPIKey) || undefined
    }
})(GoogleMapsWrapper)
