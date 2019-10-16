import React from "react";
import PropTypes from "prop-types";

import FontAwesome from "react-fontawesome";

import { CardOverlay } from "../CardOverlay";
import style from "../Visualization/styles";
import renderStyle from './styles';

const propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  renderColumns: PropTypes.object.isRequired,
  loader: PropTypes.bool,
  error: PropTypes.object,
};

class Render extends React.Component {

  renderCardWithInfo(message, iconName, spin = false) {

    return (
      <CardOverlay
        overlayStyle={style.overlayContainer}
        textStyle={style.overlayText}
        text={(
          <div style={style.fullWidth}>
            <FontAwesome
              name={iconName}
              size="2x"
              spin={spin}
            />
            <br></br>{message}
          </div>
        )}
      />
    )
  }

  getContent() {
    const {
      data,
      renderColumns
    } = this.props;

    const result = Array.isArray(data) ? data : [data];

    return result.map((d, i) => (
      <div key={i}>
          {
            result.length > 1 && 
            <h4>
              # {i + 1}
            </h4>
          }
          {
            Object.keys(renderColumns).map((key, i) => (
              <div key={i} style={{}}>
                <span style={renderStyle.label}>{renderColumns[key]}</span>
                <span style={renderStyle.value}>: {d[key]}</span>
              </div>
            ))
          }
      </div>
    ));
  }

  render() {
    const {
      error,
      loader,
      title,
    } = this.props;

    if (error) {
      return this.renderCardWithInfo("Oops, something went wrong", "meh-o");
    }

    if (loader) {
      return this.renderCardWithInfo("Please wait while loading", "circle-o-notch", true);
    }

    return (
      <div>
        <h3 style={renderStyle.centerText}> { title } </h3>
        <div>
          {this.getContent()}
        </div>
      </div>
    )
  }

}

Render.propTypes = propTypes;

export default Render;