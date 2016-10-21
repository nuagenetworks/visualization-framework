import React from "react";
import tabify from "../../../utils/tabify";
import AbstractGraph from "../AbstractGraph";


export default class Table extends AbstractGraph {
    render() {
        const { response, configuration } = this.props;
        const rows = tabify(response.results);
        const properties = configuration.data;
        const columns = properties.columns;

        const {
          border,
          fontColor,
          header,
          padding,
          width,
        } = this.getConfiguredProperties();

        if (!rows)
            return (
                <p>No Rows</p>
            );

        if (!columns)
            return (
                <p>No columns</p>
            );

        return (
            <table style={ {width:width} }>
                <thead>
                    <tr style={{color:header.fontColor, borderTop:header.border.top, borderBottom: header.border.bottom, borderLeft:header.border.left, borderRight: header.border.right}}>
                        { columns.map(({column, label}, i) =>(
                            <th key={i} style={{padding:padding}}>{ label || column }</th>
                        )) }
                    </tr>
                </thead>
                <tbody>
                    { rows.map((row, j) =>(
                        <tr key={j} style={ {color:fontColor, background:this.applyColor(j), borderTop:border.top, borderBottom: border.bottom, borderLeft:border.left, borderRight: border.right} }>
                            { columns.map(({column}, i) =>(
                                <td key={i} style={{padding:padding}}>{ row[column] }</td>
                            )) }
                        </tr>
                    )) }
                </tbody>
            </table>
        );
    }
}

Table.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};
