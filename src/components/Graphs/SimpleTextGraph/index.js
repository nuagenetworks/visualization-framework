import React from "react";

import CircularProgress from "material-ui/CircularProgress";

import AbstractGraph from "../AbstractGraph";

import "./style.css";

/*
    This is a very basic graph that displays a text message
*/
export default class SimpleTextGraph extends AbstractGraph {

    currentTitle() {
        const {
            configuration,
        } = this.props;

        if (configuration && configuration.title)
            return configuration.title;

        return "Untitled";
    }

    renderTitleIfNeeded(requestedPosition, currentPosition) {
        if (requestedPosition !== currentPosition)
            return;

        return this.currentTitle();
    }

    render() {
        const {
            height,
            onMarkClick,
            response,
            width,
        } = this.props;

        const {
          borderRadius,
          colors,
          fontColor,
          fontSize,
          innerHeight,
          innerWidth,
          margin,
          padding,
          stroke,
          titlePosition,
        } = this.getConfiguredProperties();

        console.error([margin.top, margin.right, margin.bottom, margin.left].join(" "));

        let body;
        if (response && !response.isFetching) {
            body = (
                <div style={{
                        margin: [margin.top, margin.right, margin.bottom, margin.left].join(" "),
                    }}
                    >
                        {this.renderTitleIfNeeded(titlePosition, "top")}

                        <div style={{
                            width: width * innerWidth,
                            height: height * innerHeight,
                            borderRadius: borderRadius,
                            borderColor: stroke.color,
                            borderWidth: stroke.width,
                            background: colors[0],
                            color: fontColor,
                            display: "block",
                            margin: [margin.top, margin.right, margin.bottom, margin.left].join(" "),
                            padding: [padding.top, padding.right, padding.bottom, padding.left].join(" "),
                            fontSize: fontSize,
                            }}
                          >
                          {response.results.length}
                        </div>

                        {this.renderTitleIfNeeded(titlePosition, "bottom")}
                </div>
            );
        }
        else {
            body = (
                <CircularProgress color="#eeeeee" />
            );
        }

        const style = {
            height: height,
            cursor: onMarkClick ? "pointer" : undefined
        };

        return (
            <div className="text-center" style={style} onClick={onMarkClick}>
                { body }
            </div>
        );
    }
}

SimpleTextGraph.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};
