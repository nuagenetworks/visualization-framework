import React from "react";
import tabify from "../../utils/tabify";

export default class Table extends React.Component {
    render() {
        const { response, configuration } = this.props;
        const rows = tabify(response.results);
        const properties = configuration.data;
        const columns = properties.columns;

        if (!rows)
            return (
                <p>No Rows</p>
            );

        if (!columns)
            return (
                <p>No columns</p>
            );

        return (
            <table className="table table-bordered">
                <thead>
                    <tr>
                        { columns.map(({column, label}, i) =>(
                            <th key={i}>{ label || column }</th>
                        )) }
                    </tr>
                </thead>
                <tbody>
                    { rows.map((row, j) =>(
                        <tr key={j}>
                            { columns.map(({column}, i) =>(
                                <th key={i}>{ row[column] }</th>
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
