import React from "react";
import tabify from "../../utils/tabify";

export default class Table extends React.Component {
    render() {
        const { response, configuration } = this.props;
        const data = tabify(response.results);
        const properties = configuration.data;
        const columns = properties.columns;

        console.log(data);
        console.log(columns);

        return (
            <table className="table table-bordered">
                <thead>
                    <tr>
                        { columns.map(({column, label}, i) =>(
                            <th key={i}>{ label || column }</th>
                        )) }
                    </tr>
                </thead>
            </table>
        );
    }
}

Table.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};
