import React from "react";
import tabify from "../../utils/tabify";

export default class Table extends React.Component {
    render() {
        const { response } = this.props;
        const data = tabify(response.results);

        // TODO make column order part of the configuration.
        const columns = Object.keys(data);

        return (
            <table className="table table-bordered">
                <thead>
                    <tr>
                        { columns.map((column) =>(
                            <th>{column}</th>
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
