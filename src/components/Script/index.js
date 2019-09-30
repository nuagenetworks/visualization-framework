import React from "react";
import PropTypes from "prop-types";

import * as Fetch from "./Components";

import { connect } from "react-redux";

const propTypes = {
  script: PropTypes.string,
};

class Script extends React.Component {

  constructor(props) {
    super(props);
  }


  render() {
    const {
      script,
      ...rest
    } = this.props;

    const FetchData = Fetch[script];
    return  <FetchData  {...rest} />;
  }
}

Script.propTypes = propTypes;

const mapStateToProps = (state, ownProps) => {
  const props = {
    state: state
  }

  return props;
}

export default connect(mapStateToProps, null)(Script);
