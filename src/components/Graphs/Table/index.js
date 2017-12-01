import React from 'react';
import { connect } from 'react-redux';
import { push } from "redux-router";
import DataTables from 'material-ui-datatables';
import AbstractGraph from "../AbstractGraph";
import columnAccessor from "../../../utils/columnAccessor";
import CopyToClipboard from 'react-copy-to-clipboard';
import {Tooltip} from 'react-lightweight-tooltip';

import tooltipStyle from './tooltipStyle';
import "./style.css";
import style from './style'
import {properties} from "./default.config";

import SearchBar from "../../SearchBar";

import {
    Actions as VFSActions,
    ActionKeyStore as VFSActionKeyStore
} from '../../../features/redux/actions';

class Table extends AbstractGraph {

    constructor(props, context) {
        super(props, properties);

        this.handleSortOrderChange   = this.handleSortOrderChange.bind(this);
        this.handlePreviousPageClick = this.handlePreviousPageClick.bind(this);
        this.handleNextPageClick     = this.handleNextPageClick.bind(this);
        this.handleClick             = this.handleClick.bind(this);
        this.handleSearch            = this.handleSearch.bind(this);
        this.handleRowSelection      = this.handleRowSelection.bind(this);
        this.handleContextMenu       = this.handleContextMenu.bind(this);

        /**
        */
        this.currentPage = 1;
        this.filterData = false;
        this.selectedRows = {};
        this.state = {
            selected: [],
            data: [],
            fontSize: style.defaultFontsize,
            contextMenu: null,
        }

    }

    componentWillMount() {
        this.initiate();
    }

    componentWillReceiveProps(nextProps) {
        if(JSON.stringify(this.props) !== JSON.stringify(nextProps)) {
            this.initiate();
        }
        const { selected } = nextProps;
        if (selected && JSON.stringify(selected) !== JSON.stringify(this.props.selected)) {
            this.setState({selected: [selected]});
        }
    }

    componentDidUpdate() {
        this.checkFontsize();
        const { contextMenu } = this.state;

        if (contextMenu) {
            this.openContextMenu();
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

        this.filterData = this.props.data;
        this.setHeaderData(columns);
        this.updateData();
    }

    decrementFontSize() {
        this.setState({
            fontSize: this.state.fontSize - 1
        })
    }

    checkFontsize() {
        if(this.container.querySelector('table').clientWidth > this.container.clientWidth) {
            this.decrementFontSize();
        }
    }

    resetFilters() {
        this.currentPage = 1;
        this.selectedRows = {};
    }

    handleSearch(data) {
        this.resetFilters();

        this.filterData = data;
        this.updateData();
    }

    updateData() {
        const {
            limit,
        } = this.getConfiguredProperties();

        let offset = limit * (this.currentPage - 1);

        this.setState({
            data : this.filterData.slice(offset, offset + limit),
            selected: this.selectedRows[this.currentPage] ? this.selectedRows[this.currentPage]: []
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

    setHeaderData(columns) {
        this.headerData = columns.map(({column, label}, i) => ({
            key: column,
            label: label || column,
            sortable: true,
            columnText: label || column,
            columField: column,
            type:"text"
           }
        ));
    }

    getHeaderData() {
        return this.headerData;
    }

    getTableData(columns) {
        const accessors = this.getAccessor(columns);
        const tooltipAccessor = this.getTooltipAccessor(columns);

        return this.state.data.map((d, j) => {

            let data = {};

            accessors.forEach((accessor, i) => {
                let columnData = accessor(d);

                if(columnData && columns[i].tooltip) {
                    let fullText = tooltipAccessor[i](d, true);
                    columnData = <div>
                            <Tooltip key={`tooltip${j}${i}`}
                              content={
                                [
                                  fullText,
                                  <CopyToClipboard text={fullText} key={`clipboard${j}${i}`}>
                                    <button title="copy" className="btn btn-link btn-xs fa fa-copy pointer text-white"></button>
                                  </CopyToClipboard>,
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

    handleSortOrderChange(column, order) {
        const keys = column.split(".");
        const value = (d) => keys.reduce((d, key) => d[key], d);

        this.filterData = this.filterData.sort(
          (a, b) => {
            return order === 'desc' ? value(b) > value(a) : value(a) > value(b);
          }
        );

        /**
         * Resetting the paging due to sorting
         */
        this.resetFilters();
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

    handleRowSelection(selectedRows) {
        this.selectedRows[this.currentPage] = selectedRows.slice();

        this.setState({
            selected: this.selectedRows[this.currentPage]
        })
        const { selectFlow, location } = this.props;

        if (selectFlow) {
            const selectedRows = this.getSelectedRows();
            const flow = selectedRows ? selectedRows[0] : {};
            selectFlow(flow, location.query, location.pathname);
        }
    }

    handleContextMenu(event) {
        const {
            menu
        } = this.getConfiguredProperties();

        if (!menu) {
            return false;
        }
        event.preventDefault();
        const { clientX: x, clientY: y } = event;
        this.setState({ contextMenu: { x, y } });
        return true;
    }

    handleCloseContextMenu = () => {
        this.setState({ contextMenu: null });
        this.closeContextMenu();
    }

    closeContextMenu = () => {
        document.body.removeEventListener('click', this.handleCloseContextMenu);
        const node = document.getElementById('contextMenu');
        if (node) node.remove();
    }

    openContextMenu = () => {
        const { contextMenu: { x, y } } = this.state;
        const {
            menu
        } = this.getConfiguredProperties();

        this.closeContextMenu();
        document.body.addEventListener('click', this.handleCloseContextMenu);

        const node = document.createElement('ul');
        node.classList.add('contextMenu');
        node.id = 'contextMenu';
        node.style = `top: ${y}px; left: ${x}px; z-index: 100000;`;

        const { goTo, location: { query } } = this.props;

        menu.forEach((item) => {
            const { text, rootpath } = item;
            const pathname = `${process.env.PUBLIC_URL}/${rootpath}`
            const li = document.createElement('li');
            li.textContent = text;
            li.onclick = (e) => {
                // dispatch a push to the menu link
                goTo(pathname, query);
            };
            node.append(li);
        });
        document.body.append(node);
    }

    getSelectedRows() {
        const {
            limit
        } = this.getConfiguredProperties();

        let selected = [];
        for(let page in this.selectedRows) {
            if(this.selectedRows.hasOwnProperty(page)) {
                this.selectedRows[page].forEach((index) => {
                    selected.push(this.filterData[(page - 1) * limit + index])
                })
            }
        }

        return selected;
    }


    renderSearchBarIfNeeded() {
        const {
            searchBar,
            searchText
        } = this.getConfiguredProperties();

        if(searchBar === false)
           return;

        return (
          <SearchBar
            data={this.props.data}
            options={this.getHeaderData()}
            handleSearch={this.handleSearch}
            columns={this.getColumns()}
            searchText={searchText}
          />
        );
    }

    render() {
        const {
            height,
        } = this.props;

        const {
            limit,
            selectable,
            multiSelectable,
            showCheckboxes
        } = this.getConfiguredProperties();

        let tableData = this.getTableData(this.getColumns());

        if(!tableData) {
            return "<p>No Data</p>";
        }

        return (
            <div ref={(input) => { this.container = input; }}
                onContextMenu={this.handleContextMenu}
                >
                {this.renderSearchBarIfNeeded()}
                <DataTables
                    columns={this.getHeaderData()}
                    data={tableData}
                    selectable={selectable}
                    multiSelectable={multiSelectable}
                    selectedRows={this.state.selected}
                    showCheckboxes={showCheckboxes}
                    showRowSizeControls={false}
                    onNextPageClick={this.handleNextPageClick}
                    onPreviousPageClick={this.handlePreviousPageClick}
                    onSortOrderChange={this.handleSortOrderChange}
                    onRowSelection={this.handleRowSelection}
                    page={this.currentPage}
                    count={this.filterData.length}
                    onCellClick={this.handleClick}
                    rowSize={limit}
                    tableStyle={style.table}
                    tableHeaderColumnStyle={Object.assign({}, style.headerColumn, {fontSize: this.state.fontSize})}
                    tableRowStyle={style.row}
                    tableRowColumnStyle={Object.assign({}, style.rowColumn, {fontSize: this.state.fontSize})}
                    tableBodyStyle={Object.assign({}, style.body, {height: `${height - 100}px`})}
                    footerToolbarStyle={style.footerToolbar}
                />
            </div>
        );
    }
}

Table.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};

const mapStateToProps = (state, customProps) => {
    const location = state.router.location;

    return {
        location,
        selected: state.VFS.get(VFSActionKeyStore.VFS_SELECTED_FLOW_DATA),
    }
}

const actionCreators = (dispatch) => ({
    selectFlow: (flow, currentQueryParams, currentPath) => dispatch(VFSActions.selectFlow(flow, currentQueryParams, currentPath)),
    goTo: (link, queryParams) => {
        dispatch(push({pathname: link, query: queryParams}));
    }
});

export default connect ( mapStateToProps, actionCreators) (Table);
