import React from "react";

import AbstractGraph from "../AbstractGraph";

import "./style.css";

import {properties} from "./default.config"

/*
    This is a very basic graph that displays a text message
*/

const INITIAL_FONT_SIZE = 4

export default class SimpleTextGraph extends AbstractGraph {

    constructor(props) {
        super(props, properties);

        this.state = {
            fontSize: INITIAL_FONT_SIZE,
        }
    }

    componentDidMount() {
        this.checkFontsize()
    }

    componentDidUpdate() {
        this.checkFontsize()
    }

    componentWillReceiveProps(nextProps) {

        const {
            fontSize
          } = this.getConfiguredProperties();
        // reset font size on resize
        if(this.props.height !== nextProps.height || this.props.width !== nextProps.width) {
            this.setState({ fontSize: INITIAL_FONT_SIZE})
        }
    }

    checkFontsize() {
        const {
            height,
            width,
            data
        } = this.props;

        const {
          innerWidth,
          innerHeight,
          targetedColumn,
          defaultFontSize
        } = this.getConfiguredProperties();

        if (!data || !data.length)
            return;

        const text = this.displayText(data, targetedColumn)

        const blockWidth = width * innerWidth
        const blockHeight = height * innerHeight
        const textSize = this.state.fontSize * text.toString().length * 0.7

        if(text.toString().length <= 3 && this.state.fontSize !== defaultFontSize) {
            this.setState({
                fontSize: defaultFontSize
            })
        }
        else if(blockWidth > textSize && blockHeight > textSize) {
            this.setState({
                fontSize: this.state.fontSize + 1
            })
        }
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

    displayText(data, targetedColumn) {
        if (!data)
            return

        if (!targetedColumn)
            return data.length

        return data[0][targetedColumn];
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
          innerHeight,
          innerWidth,
          margin,
          padding,
          stroke,
          textAlign,
          titlePosition,
          targetedColumn,
          chartWidthToPixel
        } = this.getConfiguredProperties();

        if (!data || !data.length)
            return;

        const cursor = onMarkClick ? "pointer" : undefined
        const text = this.displayText(data, targetedColumn)
        const blockWidth = width * innerWidth
        const blockHeight = height * innerHeight

        return (
                <div
                    style={{
                        margin: [margin.top, margin.right, margin.bottom, margin.left].join(" "),
                        textAlign: textAlign,
                        display: "table",
                        fontSize: "16px"
                    }}
                    onClick={onMarkClick}
                    >
                        {this.renderTitleIfNeeded(titlePosition, "top")}

                        <div style={{
                            width: blockWidth,
                            height: blockHeight,
                            borderRadius: borderRadius,
                            borderColor: stroke.color,
                            borderWidth: stroke.width,
                            background: colors[0],
                            color: fontColor,
                            fontSize: this.state.fontSize,
                            cursor:cursor,
                            margin: 'auto',
                            marginTop: 20
                            }}
                          >
                          <div style={{
                              marginLeft: "auto",
                              marginRight: "auto",
                              width: blockWidth,
                              padding: [padding.top, padding.right, padding.bottom, padding.left].join(" "),
                              height: blockHeight,
                              display: "table-cell",
                              verticalAlign: "middle"
                            }}>
                              {this.displayText(data, targetedColumn)}
                            </div>
                        </div>

                        {this.renderTitleIfNeeded(titlePosition, "bottom")}
                </div>
        );

    }
}

SimpleTextGraph.propTypes = {
  configuration: React.PropTypes.object
};
