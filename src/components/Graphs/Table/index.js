import React from "react";
import AbstractGraph from "../AbstractGraph";
import columnAccessor from "../../../utils/columnAccessor";

import {properties} from "./default.config"

export default class Table extends AbstractGraph {

    constructor(props) {
        super(props, properties);
    }

    render() {

        const {
            data,
            configuration,
            onMarkClick,
            width,
            height
        } = this.props;

        if (!data || !data.length)
            return;

        const properties = configuration.data;
        const columns = properties.columns;

        const {
            border,
            fontColor,
            header,
            padding
        } = this.getConfiguredProperties();

        const accessors = columns.map(columnAccessor);

        if (!data)
            return (
                <p>No Rows</p>
            );

        if (!columns)
            return (
                <p>No columns</p>
            );

        return (
            <div
                style={{
                    width: width + "px",
                    height: height + "px",
                    overflow: "auto"
                }}
            >
                <table style={{ width: "100%" }} >
                    <thead>
                        <tr style={{
                            color:header.fontColor,
                            borderTop:header.border.top,
                            borderBottom: header.border.bottom,
                            borderLeft:header.border.left,
                            borderRight: header.border.right
                        }}>
                            { columns.map(({column, label}, i) =>(
                                <th key={i} style={{padding:padding}}>{ label || column }</th>
                            )) }
                        </tr>
                    </thead>
                    <tbody>
                        { data.map((d, j) => {

                            // Set up clicking and cursor style.
                            let onClick, cursor;
                            if(onMarkClick){
                                onClick = () => onMarkClick(d);
                                cursor = "pointer";
                            }

                            return (
                                <tr
                                    key={j}
                                    style={{
                                        color:fontColor,
                                        background:this.applyColor(j),
                                        borderTop:border.top,
                                        borderBottom: border.bottom,
                                        borderLeft:border.left,
                                        borderRight: border.right,
                                        cursor: cursor
                                    }}
                                    onClick={onClick}
                                >
                                    { accessors.map((accessor, i) =>(
                                        <td key={i} style={{padding:padding}}>
                                          { accessor(d) }
                                        </td>
                                    )) }
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}

Table.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};
