import React from 'react'
import { connect } from 'react-redux'
import { push } from "redux-router"
import DataTables from 'material-ui-datatables'
import AbstractGraph from "../AbstractGraph"
import columnAccessor from "../../../utils/columnAccessor"
import CopyToClipboard from 'react-copy-to-clipboard'
import {Tooltip} from 'react-lightweight-tooltip'
import _ from 'lodash'

import tooltipStyle from './tooltipStyle'
import "./style.css"
import style from './style'
import {properties} from "./default.config"

import SearchBar from "../../SearchBar"

import {
    Actions as VFSActions,
} from '../../../features/redux/actions'

class Table extends AbstractGraph {

    constructor(props) {
        super(props, properties)

        const {
            searchText
        } = this.getConfiguredProperties()

        let { context } = props

        this.filterContextId = `${this.props.configuration.id}-searchText`

        this.handleSortOrderChange   = this.handleSortOrderChange.bind(this)
        this.handlePreviousPageClick = this.handlePreviousPageClick.bind(this)
        this.handleNextPageClick     = this.handleNextPageClick.bind(this)
        this.handleClick             = this.handleClick.bind(this)
        this.handleSearch            = this.handleSearch.bind(this)
        this.handleRowSelection      = this.handleRowSelection.bind(this)
        this.handleContextMenu       = this.handleContextMenu.bind(this)

        /**
        */
        this.currentPage = 1
        this.filterData = false
        this.selectedRows = {}
        this.htmlData = {}

        this.state = {
            selected: [],
            data: [],
            contextMenu: null,
            fontSize: style.defaultFontsize,
            search:  context.hasOwnProperty(this.filterContextId) ? context[this.filterContextId] : searchText
        }
    }

    componentWillMount() {
        this.filterData = this.props.data
        this.initiate()
    }

    componentDidMount() {
        this.checkFontsize()
    }

    componentWillReceiveProps(nextProps) {
        // reset font size on resize
        if(this.props.height !== nextProps.height || this.props.width !== nextProps.width) {
            this.setState({ fontSize: style.defaultFontsize})
        } else if(!_.isEqual(nextProps.data, this.props.data)) {
            this.filterData = this.props.data
            this.initiate()
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
        this.resetFilters()
        this.setHeaderData(columns);
        this.updateData();
    }

    decrementFontSize() {
        this.setState({
            fontSize: this.state.fontSize - 1
        })
    }

    checkFontsize() {
        if(this.container && this.container.querySelector('table').clientWidth > this.container.clientWidth) {
            this.decrementFontSize();
        }
    }

    resetFilters(page = null, select = null) {
        const {
            configuration,
            context
        } = this.props

        this.currentPage  = page || (context.hasOwnProperty(`${configuration.id}-page`) ? JSON.parse(context[`${configuration.id}-page`]) : 1)
        this.selectedRows = select || (context.hasOwnProperty(`${configuration.id}-select`) ? JSON.parse(context[`${configuration.id}-select`]) : {})
    }

    handleSearch(data, query) {
        const {
            context
        } = this.props

        // reset pagination and selected row data on new query
        if(context[this.filterContextId] !== query){
            this.currentPage = 1
            this.selectedRows = {}
            this.updatePageContext()
            this.updateSelectContext()
        } else {
            this.resetFilters()
        }

        this.filterData = data
        this.updateData({
            search: query
        })

        this.props.goTo(window.location.pathname, Object.assign({}, this.props.context, {[this.filterContextId]: query}))
    }

    updateData(state = {}) {
        const {
            limit,
        } = this.getConfiguredProperties();

        let offset = limit * (this.currentPage - 1);

        this.setState(Object.assign({
            data : this.filterData.slice(offset, offset + limit),
            selected: this.selectedRows[this.currentPage] ? this.selectedRows[this.currentPage]: []
        }, state))
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
            type:"text",
            style: {
              textIndent: '2px'
            }
           }
        ));
    }

    getHeaderData() {
        return this.headerData;
    }

    getTableData(columns) {
        const {
            highlight,
            highlightColor
        } = this.getConfiguredProperties();

        if(!columns)
            return []

        const accessors = this.getAccessor(columns);
        const tooltipAccessor = this.getTooltipAccessor(columns);

        return this.state.data.map((d, j) => {

            let data = {},
                highlighter = false;

            accessors.forEach((accessor, i) => {
                let originalData = accessor(d),
                    columnData   = originalData

                if(columnData && columns[i].tooltip) {
                    let fullText = tooltipAccessor[i](d, true)
                    let hoverContent = (
                        <div key={`tooltip_${j}_${i}`}>
                            {fullText}
                            <CopyToClipboard text={fullText ? fullText : ''}><button title="copy" className="btn btn-link btn-xs fa fa-copy pointer text-white"></button></CopyToClipboard>
                        </div>
                    )

                    columnData = (
                        <Tooltip key={`tooltip_${j}_${i}`}
                            content={[hoverContent]}
                            styles={tooltipStyle}>
                                {columnData}
                        </Tooltip>
                    )
                }

                if(highlight && highlight.includes(columns[i].column) && originalData) {
                    highlighter = true
                }

                data[columns[i].column] = columnData;
            });

            if(highlighter)
               Object.keys(data).map( key => {
                return data[key] = <div style={{background: highlightColor, height: style.row.height, padding: "10px 0"}}>{data[key]}</div>
            })


            return data
        })
    }

    handleSortOrderChange(column, order) {
        const value = columnAccessor({column})
        this.filterData = this.filterData.sort(
          (a, b) => {
             if(order === 'desc')
               return value(b) > value(a) ? 1 : -1

            return value(a) > value(b) ? 1 : -1
          }
        );

        /**
         * Resetting the paging due to sorting
         */

        // while sorting data, pagination will be same and selectable row will be reset
        this.currentPage = 1
        this.selectedRows = {}
        this.updatePageContext()
        this.updateSelectContext()

        this.updateData();
    }

    // update selected rows in context
    updateSelectContext() {
        const {
            context,
            configuration
        } = this.props

        this.props.goTo(window.location.pathname, Object.assign({}, context, {[`${configuration.id}-select`]: JSON.stringify(this.selectedRows)}))
    }

    // update current pagination in context
    updatePageContext() {
        const {
            context,
            configuration
        } = this.props

        this.props.goTo(window.location.pathname, Object.assign({}, context, {[`${configuration.id}-page`]: this.currentPage}))
    }

    handlePreviousPageClick() {
        --this.currentPage
        this.updatePageContext()
        this.updateData()
    }

    handleNextPageClick() {
        ++this.currentPage
        this.updatePageContext()
        this.updateData()
    }

    handleClick(key) {
        if(this.props.onMarkClick && this.state.data[key])
           this.props.onMarkClick(this.state.data[key]);
    }

    handleRowSelection(selectedRows) {
        const {
            data
        } = this.props

        const {
            multiSelectable,
            selectedColumn
        } = this.getConfiguredProperties();

        if(!multiSelectable) {
            this.handleClick(...selectedRows)
        }

        this.selectedRows[this.currentPage] = selectedRows.slice();
        this.setState({
            selected: this.selectedRows[this.currentPage]
        })

        this.updateSelectContext()

        const { selectRow, location } = this.props;
        if (selectRow) {
            let matchingRows = []
            const selectedRows = this.getSelectedRows();
            const row = selectedRows ? selectedRows[0] : {};

            /**
             * Compare `selectedColumn` value with all available datas and if equal to selected row,
             * then save all matched records in store under "matchedRows",
            **/

            if(selectedColumn) {

                const value = columnAccessor({column: selectedColumn})
                matchingRows = data.filter( (d) => {
                    return value(row) && row !== d && value(row) === value(d)
                });
            }
           selectRow(this.props.configuration.id, row, matchingRows, location.query, location.pathname);
        }

    }

    handleContextMenu(event) {
        const {
            menu
        } = this.getConfiguredProperties();

        if (!menu) {
            return false;
        }
        event.preventDefault()
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

        const { goTo, location: { query }, configuration: { id } } = this.props;
        query.id = id;

        menu.forEach((item) => {
            const { text, rootpath, params } = item;
            const pathname = `${process.env.PUBLIC_URL}/${rootpath}`
            const li = document.createElement('li');
            li.textContent = text;
            const queryParams = (params && Object.getOwnPropertyNames(params).length > 0) ?
                    Object.assign({}, query, params) : Object.assign({}, query);
            li.onclick = (e) => {
                // dispatch a push to the menu link
                goTo(pathname, queryParams);
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
            search
        } = this.state

        const {
            searchBar
        } = this.getConfiguredProperties();

        if(searchBar === false)
           return

        return (
          <SearchBar
            data={this.props.data}
            searchText={search}
            options={this.getHeaderData()}
            handleSearch={this.handleSearch}
            columns={this.getColumns()}
          />
        );
    }

    removeHighlighter(data = []) {
        const {
            highlight
        } = this.getConfiguredProperties();

        if(!data.length)
          return data

        if(highlight) {
            this.state.selected.map( (key) => {
                if(highlight && data[key]) {
                    for (let i in data[key]) {
                        if (data[key].hasOwnProperty(i)) {
                            if(data[key][i].props.style)
                                data[key][i].props.style.background = ''
                        }
                    }
                }
            })
        }
        return data
    }

    render() {
        const {
            height,
            data
        } = this.props;

        const {
            limit,
            selectable,
            multiSelectable,
            showCheckboxes,
            hidePagination,
            searchBar
        } = this.getConfiguredProperties();

        if(!data || !data.length) {
            return
        }

        let tableData = this.getTableData(this.getColumns())

        // overrite style of highlighted selected row
        tableData = this.removeHighlighter(tableData)

        let showFooter = (data.length <= limit && hidePagination !== false) ? false : true,
          heightMargin  =  showFooter ?  100 : 80

          heightMargin = searchBar === false ? heightMargin * 0.3 : heightMargin

          return (
            <div ref={(input) => { this.container = input; }}
                onContextMenu={this.handleContextMenu}
                >
                {this.renderSearchBarIfNeeded()}
                <DataTables
                    columns={this.getHeaderData()}
                    data={tableData}
                    showHeaderToolbar={false}
                    showFooterToolbar={showFooter}
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
                    tableBodyStyle={Object.assign({}, style.body, {height: `${height - heightMargin}px`})}
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

const mapStateToProps = (state) => {
    return {
        location: state.router.location
    }
}

const actionCreators = (dispatch) => ({
    selectRow: (vssID, row, matchingRows, currentQueryParams, currentPath) => dispatch(VFSActions.selectRow(vssID, row, matchingRows, currentQueryParams, currentPath)),
    goTo: (link, queryParams) => {
        dispatch(push({pathname: link, query: queryParams}));
    }
});

export default connect (mapStateToProps, actionCreators) (Table);
