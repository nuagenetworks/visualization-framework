import React from 'react';
import DataTables from 'material-ui-datatables';
import AbstractGraph from "../AbstractGraph";
import columnAccessor from "../../../utils/columnAccessor";
import CopyToClipboard from 'react-copy-to-clipboard';
import {Tooltip} from 'react-lightweight-tooltip';

import tooltipStyle from './tooltipStyle.js';
import "./style.css";
import {properties} from "./default.config";

export default class Table extends AbstractGraph {

    constructor(props, context) {
        super(props, properties);

        this.handleSortOrderChange   = this.handleSortOrderChange.bind(this);
        this.handleFilterValueChange = this.handleFilterValueChange.bind(this);
        this.handlePreviousPageClick = this.handlePreviousPageClick.bind(this);
        this.handleNextPageClick     = this.handleNextPageClick.bind(this);
        this.handleClick             = this.handleClick.bind(this);

        /**
        */
        this.currentPage = 1;
        this.filterData = false;

        this.state = {
            data: []
        }
    }

    componentWillMount() {
        this.initiate();
    }

    componentWillReceiveProps(nextProps) {
        if(this.props !== nextProps) {
            this.initiate();
        }
    }

    initiate() {
        let columns = this.getColumns();

        if (!columns)
            return;

        /*
         * On data change, resetting the paging and filtered data to 1 and false respectively.
         */
        this.resetFilters();

        this.getHeaderData(columns);
        this.updateData();
    }

    resetFilters() {
        this.currentPage = 1;
        this.filterData = this.props.data;
    }

    updateData() {
        const {
            limit,
        } = this.getConfiguredProperties();

        let offset = limit * (this.currentPage - 1);

        this.setState({
            data : this.filterData.slice(offset, offset + limit)
        });
    }

    getColumns() {
        const {
            data,
            configuration,
        } = this.props;

        if (!data || !data.length)
            return;

        return configuration.data.columns;
    }

    getAccessor(columns) {
        return columns.map(columnAccessor);
    }

    getTooltipAccessor(columns) {
        return columns.map(column => {
            return column.tooltip ? columnAccessor(column.tooltip) : () => {}
        });
    }

    getHeaderData(columns) {

        const {
            padding,
        } = this.getConfiguredProperties();

        this.headerData = columns.map(({column, label}, i) => ({
            key: column,
            label: label || column,
            sortable: true,
            style: {
                padding: padding,
            }}
        ));
    }

    getTableData(columns) {
        const accessors = this.getAccessor(columns);
        const tooltipAccessor = this.getTooltipAccessor(columns);

        return this.state.data.map((d, j) => {

            let data = {};

            accessors.forEach((accessor, i) => {
                let columnData = accessor(d);

                if(columns[i].tooltip) {
                    let fullText = tooltipAccessor[i](d, true);
                    columnData = <div>
                            <Tooltip key={`tooltip_${j}_${i}`}
                              content={
                                [
                                  fullText,
                                  <CopyToClipboard text={fullText}><button title="copy" className="btn btn-link btn-xs fa fa-copy pointer text-white"></button></CopyToClipboard>,
                                ]
                              }
                              styles={tooltipStyle}>
                              <a className="pointer">
                                 {columnData}
                              </a>
                            </Tooltip>
                        </div>
                }

                data[columns[i].column] = columnData;
            });

            return data;
        })
    }

    handleFilterValueChange(search) {
        const {
            data
        } = this.props;

        this.resetFilters();

        if(search) {
            const columns = this.getColumns();
            const accessors = this.getAccessor(columns);
            this.filterData = data.filter((d, j) => {
                let match = false;
                accessors.forEach((accessor, i) => {
                    if(accessor(d, true) && accessor(d, true).toString().toLowerCase().includes(search.toLowerCase()))
                       match = true;
                });

                return match;
            });
        }

        this.updateData();
    }

    handleSortOrderChange(column, order) {

        this.filterData = this.filterData.map(function(element) {
            if(!element.hasOwnProperty(column)) {
                element[column] = '';
            }
            return element;
        });

        this.filterData = this.filterData.sort(
          (a, b) => {
            return order === 'desc' ? b[column] > a[column] : a[column] > b[column]
          }
        );

        this.updateData();
    }

    handlePreviousPageClick() {
        --this.currentPage;
        this.updateData();
    }

    handleNextPageClick() {
        ++this.currentPage;
        this.updateData();
    }

    handleClick(key) {
        if(this.props.onMarkClick && this.state.data[key])
           this.props.onMarkClick(this.state.data[key]);
    }

    render() {
        const {
            width,
            height,
        } = this.props;

        const {
            limit
        } = this.getConfiguredProperties();

        let tableData = this.getTableData(this.getColumns());

        if(!tableData) {
            return "<p>No Data</p>";
        }

        return (
            <div
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    overflow: "auto"
                }}
            >

                <DataTables
                    headerToolbarMode={"filter"}
                    showRowHover={false}
                    showHeaderToolbar={true}
                    showHeaderToolbarFilterIcon={false}
                    multiSelectable={true}
                    columns={this.headerData}
                    data={tableData}
                    showRowSizeControls={false}
                    onNextPageClick={this.handleNextPageClick}
                    onPreviousPageClick={this.handlePreviousPageClick}
                    onFilterValueChange={this.handleFilterValueChange}
                    onSortOrderChange={this.handleSortOrderChange}
                    page={this.currentPage}
                    count={this.filterData.length}
                    onCellClick={this.handleClick}
                    rowSize={limit}
                    tableStyle={{
                        width: "inherit",
                        minWidth: "100%"
                    }}
                    tableBodyStyle={{overflowX: "scroll"}}
                />
            </div>
        );
    }
}

Table.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};
