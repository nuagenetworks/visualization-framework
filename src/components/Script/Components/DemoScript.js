import React from "react";
import PropTypes from "prop-types";

import Render from "../Render";
import { VSDService } from "../../../configs/nuage/vsd";

const propTypes = {
  state: PropTypes.object.isRequired,
};

class DemoScript extends React.Component {

  VSDQuery = {
    parentResource: "enterprises",
    resource: "nsgatewayssummaries"
  };

  renderColumns = {
    id : "ID",
    name : "name"
  };

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      error: null,
      loader: true
    };
  }

  componentDidMount() {
    const {
      state
    } = this.props;

    VSDService.fetch(this.VSDQuery, state)
      .then((results) => {
        this.setState({
          error: null,
          data: results,
          loader: false
        });
      })
      .catch((error) => {
        this.setState({
          error: error
        });
      });

  }

  render() {
    const { value } = this.props;
    return (
      <div>
      {
        <Render 
          title={value}
          renderColumns={this.renderColumns}
          {...this.state}
        />
      }
      </div>
    );
  }
}

DemoScript.propTypes = propTypes;

export default DemoScript;
