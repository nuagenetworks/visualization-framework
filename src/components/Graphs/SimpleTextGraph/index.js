import React from "react";

import AbstractGraph from "../AbstractGraph";

import "./style.css";

import {properties} from "./default.config"

/*
    This is a very basic graph that displays a text message
*/
export default class SimpleTextGraph extends AbstractGraph {

    constructor(props) {
        super(props, properties);
    }
    
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
            data,
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
          textAlign,
          titlePosition,
        } = this.getConfiguredProperties();

        if (!data || !data.length)
            return;

        const cursor = onMarkClick ? "pointer" : undefined

        return (
                <div
                    style={{
                        margin: [margin.top, margin.right, margin.bottom, margin.left].join(" "),
                        textAlign: textAlign
                    }}
                    onClick={onMarkClick}
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
                            cursor:cursor,
                            }}
                          >
                          {data.length}
                        </div>

                        {this.renderTitleIfNeeded(titlePosition, "bottom")}
                </div>
        );

    }
}

SimpleTextGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.object
};
