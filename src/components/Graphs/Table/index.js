import React from 'react'
import { connect } from 'react-redux'
import { push } from "redux-router"
import DataTables from 'material-ui-datatables'
import CopyToClipboard from 'react-copy-to-clipboard'
import {Tooltip} from 'react-lightweight-tooltip'
import _ from 'lodash'
import SuperSelectField from 'material-ui-superselectfield'

import AbstractGraph from "../AbstractGraph"
import columnAccessor from "../../../utils/columnAccessor"
import tooltipStyle from './tooltipStyle'
import "./style.css"
import style from './style'
import {properties} from "./default.config"
import { pick } from '../../../utils/helpers'

import SearchBar from "../../SearchBar"

import {
    Actions as VFSActions,
} from '../../../features/redux/actions'

const PROPS_FILTER_KEY = ['data', 'height', 'width', 'context']
const STATE_FILTER_KEY = ['selected', 'data', 'fontSize', 'contextMenu']

class Table extends AbstractGraph {

    constructor(props, context) {
        super(props, properties)

        this.handleSortOrderChange   = this.handleSortOrderChange.bind(this)
        this.handlePreviousPageClick = this.handlePreviousPageClick.bind(this)
        this.handleNextPageClick     = this.handleNextPageClick.bind(this)
        this.handleClick             = this.handleClick.bind(this)
        this.handleSearch            = this.handleSearch.bind(this)
        this.handleRowSelection      = this.handleRowSelection.bind(this)
        this.handleContextMenu       = this.handleContextMenu.bind(this)
        this.handleColumnSelection   = this.handleColumnSelection.bind(this)
        this.selectionColumnRenderer = this.selectionColumnRenderer.bind(this)

        this.columns = `${props.configuration.id}-columns`

        /**
        */
        this.currentPage = 1
        this.filterData = false
        this.selectedRows = {}
        this.htmlData = {}
        this.state = {
            selected: [],
            data: [],
            fontSize: style.defaultFontsize,
            contextMenu: null,
            columns: []
        }
    }

    componentWillMount() {
        this.initiate();
    }

    componentDidMount() {
        this.checkFontsize()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(pick(this.props, ...PROPS_FILTER_KEY), pick(nextProps, ...PROPS_FILTER_KEY))
          || !_.isEqual(pick(this.state, ...STATE_FILTER_KEY), pick(nextState, ...STATE_FILTER_KEY))
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(pick(this.props, ...PROPS_FILTER_KEY), pick(nextProps, ...PROPS_FILTER_KEY))) {
            // reset font size on resize
            if(this.props.height !== nextProps.height || this.props.width !== nextProps.width) {
                this.setState({ fontSize: style.defaultFontsize})
            }

            if(this.props.context[this.columns] === nextProps.context[this.columns])
                this.initiate();
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

        const {
            context
        } = this.props

        const {
            selectColumnOption
        } = this.getConfiguredProperties()

        let columns = this.getColumns();

        if (!columns)
            return;

        /*
         * On data change, resetting the paging and filtered data to 1 and false respectively.
         */
        this.resetFilters();

        this.filterData = this.props.data;

        let columnsContext = context.hasOwnProperty(this.columns) ? context[this.columns] : false

        // filter columns who will be display in table
        let filteredColumns = columns.filter( d => {
                Object.assign(d, {value: d.label})
                if(!selectColumnOption) {
                    return true
                }
                else if(columnsContext) {
                    return columnsContext.indexOf(d.label) > -1 || false
                }
                else {
                   return d.display !== false
                }
            })

        this.setState({columns: filteredColumns})

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

    // filter and formatting columns for table header
    getHeaderData() {
        let columns = this.getColumns()
        let headerData = []
        for(let index in columns) {
            if(columns.hasOwnProperty(index)) {
                let columnRow = columns[index]
                if(this.state.columns.filter( d => d.value === columnRow.label).length) {
                    headerData.push({
                        key: columnRow.column,
                        label: columnRow.label || columnRow.column,
                        sortable: true,
                        columnText: columnRow.label || columnRow.column,
                        columField: columnRow.column,
                        type:"text",
                        style: {
                          textIndent: '2px'
                        }
                    })
                }
            }
        }

        return headerData
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

                if((columnData || columnData === 0) && columns[i].tooltip) {
                    let fullText = tooltipAccessor[i](d, true)
                    let hoverContent = (
                        <div key={`tooltip_${j}_${i}`}>
                            {fullText}
                            <CopyToClipboard text={fullText ? fullText.toString() : ''}><button title="copy" className="btn btn-link btn-xs fa fa-copy pointer text-white"></button></CopyToClipboard>
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
        const {
            data
        } = this.props

        const {
            multiSelectable,
            selectedColumn
        } = this.getConfiguredProperties();

        if(!multiSelectable) {
            this.handleClick(...selectedRows)
            this.selectedRows = {}
        }

        this.selectedRows[this.currentPage] = selectedRows.slice();
        this.setState({
            selected: this.selectedRows[this.currentPage]
        })

        const { selectRow, location } = this.props;
        if (selectRow) {
            let matchingRows = []

            let rows = {}
            const selectedData = this.getSelectedRows()

            if(selectedData.length > 1) {
                rows = selectedData
            } else {
                let row =  selectedData.length ? selectedData[0] : {}
                /**
                 * Compare `selectedColumn` value with all available datas and if equal to selected row,
                 * then save all matched records in store under "matchedRows",
                **/
                if(selectedColumn) {
                    const value = columnAccessor({column: selectedColumn})
                    matchingRows = data.filter( (d) => {
                        return (value(row) || value(row) === 0) && row !== d && value(row) === value(d)
                    });
                }

                rows = row
            }
           selectRow(this.props.configuration.id, rows, matchingRows, location.query, location.pathname);
        }

    }

    getMenu() {
        const {
            menu,
            multiMenu,
            multiSelectable
        } = this.getConfiguredProperties();

        if (multiMenu && this.getSelectedRows().length > 1) {
            return multiMenu
        }

        return menu || false
    }

    handleContextMenu(event) {
        let menu = this.getMenu()

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
        const menu = this.getMenu()

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

    renderSearchBarIfNeeded(headerData) {
        const {
            searchBar,
            searchText
        } = this.getConfiguredProperties();

        if(searchBar === false)
           return;

        return (
          <SearchBar
            data={this.props.data}
            searchText={searchText}
            options={headerData}
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


    handleColumnSelection(columns, name) {
        let columnsData = []
        columns.forEach( d => {columnsData.push(d.label)})
        this.setState({ columns })
        this.props.goTo(window.location.pathname, Object.assign({}, this.props.context, {[this.columns]: JSON.stringify(columnsData)}))
    }

    getColumnListItem() {

        return  this.getColumns().map( column => {
          return (
            <div style={{
                whiteSpace: 'normal',
                display: 'flex',
                justifyContent: 'space-between',
                lineHeight: 'normal',
              }}
              key={column.label}
              label={column.label}
              value={column.label}>
                {column.label}
            </div>)
        })
    }

    selectionColumnRenderer(values, hintText) {
        if (!values) return hintText
        const { value, label } = values
        if (Array.isArray(values)) {
           return values.length
              ? `Select Columns`
              : hintText
        }
        else if (label || value) return label || value
        else return hintText
    }

    filteredColumnBar(selectColumnOption = false) {
        const {
            id
        } = this.props

        if(!selectColumnOption) {
            return
        }

        return (
            <div style={{float:'right', display: "flex"}}>
                <SuperSelectField
                    name={id}
                    multiple
                    checkPosition='left'
                    hintText='Select Columns'
                    onSelect={this.handleColumnSelection}
                    value={this.state.columns}
                    keepSearchOnSelect
                    elementHeight={40}
                    selectionsRenderer={this.selectionColumnRenderer}
                    style={{ minWidth: 225, margin: 10, outline: "white", fontSize: 16}}
                    innerDivStyle={{border: "1px solid #dad1d1"}}
                    underlineFocusStyle={{outline: "white"}}
                >
                    {this.getColumnListItem()}
                </SuperSelectField>
            </div>
        )
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
            searchBar,
            selectColumnOption
        } = this.getConfiguredProperties();

        if(!data || !data.length) {
            return
        }

        let tableData  = this.getTableData(this.getColumns()),
            headerData = this.getHeaderData()

        // overrite style of highlighted selected row
        tableData = this.removeHighlighter(tableData)

        let showFooter = (data.length <= limit && hidePagination !== false) ? false : true,
          heightMargin  =  showFooter ?  100 : 80

          heightMargin = searchBar === false ? heightMargin * 0.3 : heightMargin

          heightMargin = selectColumnOption ? heightMargin + 50 : heightMargin

        return (
            <div ref={(input) => { this.container = input; }}
                onContextMenu={this.handleContextMenu}
                >

                {this.filteredColumnBar(selectColumnOption)}
                <div style={{clear:"both"}}></div>

                {this.renderSearchBarIfNeeded(headerData)}
                <DataTables
                    columns={headerData}
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

export default connect ( mapStateToProps, actionCreators) (Table);
