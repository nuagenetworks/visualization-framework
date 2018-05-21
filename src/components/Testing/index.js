import React, { Component } from "react";
import { connect } from "react-redux";
import 'react-notifications/lib/notifications.css';
import { push } from "redux-router";
import DataTables from 'material-ui-datatables';
import FontAwesome from "react-fontawesome";
import moment from "moment";
import {NotificationContainer, NotificationManager} from 'react-notifications';
import style from "./style";
import Panel from "../Common/Panel";
import { Actions, ActionKeyStore } from "./redux/actions";
import { CardOverlay } from "../CardOverlay";

const configUrl = 'testing/reports';

class Testing extends Component {

  constructor() {
  super();
	this.table_columns = [
	  {
	    key: 'created_at',
	    label: 'Initiated Time',
	    sortable : true,
	    render: (created_at, all) => <p>{created_at ? moment(created_at).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</p>
	  },
	  {
	    key: 'started_at',
	    label: 'Started Time',
	    sortable : true,
	    render: (started_at, all) => <p>{started_at ? moment(started_at).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</p>

	  },
	  {
	    key: 'completed_at',
	    label: 'Completed Time',
	    sortable : true,
	    render: (completed_at, all) => <p>{completed_at ? moment(completed_at).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</p>

	  },
	  {
	    key: 'total',
	    label: 'Total',
	    sortable : true
	  },
	  {
	    key: 'pass',
	    label: 'Pass',
	    sortable : true
	  },
	  {
	    key: 'fail',
	    label: 'Fail',
	    sortable : true
	  },
	  {
	    key: 'status',
	    label: 'Status',
	    sortable : true,
	    render: (status, all) => <p>{status.toUpperCase()}</p>
	  },
	  {
	    key: 'id',
	    label: 'Action',
	    render: (id, all) =>
	    	<span>
	    		<span className="btn btn-default btn-xs" style={style.actionBtn} onTouchTap={() => {this.props.goTo(`${process.env.PUBLIC_URL}/testing/reports/detail/${id}`)}}>
	    			<FontAwesome name='eye'></FontAwesome>
    			</span>
    			<span className="btn btn-primary btn-xs" style={style.actionBtn} onTouchTap={() => {this.props.goTo(`${process.env.PUBLIC_URL}/testing/reports/edit/${id}`)}}>
	    			<FontAwesome name='pencil'></FontAwesome>
    			</span>
    			<span className="btn btn-danger btn-xs" style={style.actionBtn} onTouchTap={() => {this.deleteReport(id)}}>
	    			<FontAwesome name='trash'></FontAwesome>
    			</span>
	  		</span>
	  }
	];

    this.currentPage = 1;
    this.limit = 10;
    this.totalData = 0;
    this.sortBy = {column : 'id',order : 'desc'};
    this.searchString = '';

    this.state = {
    	data: [],
      searchString : ''
    };

    this.handlePreviousPageClick = this.handlePreviousPageClick.bind(this);
    this.handleNextPageClick     = this.handleNextPageClick.bind(this);
    this.handleSortOrderChange   = this.handleSortOrderChange.bind(this);
    this.handleFilterValueChange = this.handleFilterValueChange.bind(this);
    this.deleteReport            = this.deleteReport.bind(this);
  }

  componentDidMount() {
    this.initiate();
  }

  componentWillReceiveProps(nextProps) {
    if(this.props !== nextProps) {
      this.updateData(nextProps);
    }
  }

  initiate() {
    this.getAllReports();
  }

  getAllReports(pageNum, search, sortBy) {
    
    const {
      getReport,
    } = this.props;
    
    let pageId = typeof pageNum !== 'undefined' ? pageNum : this.currentPage;
    let searchString = typeof search !== 'undefined' ? search : '';
    let sortOrder = typeof sortBy !== 'undefined' ? sortBy : {column : 'id',order : 'desc'};

    let params = {
      page:pageId,
      search:searchString,
      sortBy:sortOrder,
      limit:this.limit
    }

    getReport(`testing/reports`,'POST', params);
  }

  countTotalRecords(records) {
    if(typeof records !== 'undefined') {
      let totalRecords = 0;
      for(let rec of records) {
        totalRecords = rec.totalRecords
      }
      this.totalData = totalRecords;
    }

  }

  deleteReport(id) {
    const {
      deleteReport,
    } = this.props;
    
    deleteReport(`testing/reports/delete/${id}`).then( () => {
      this.getAllReports(this.currentPage, this.searchString, this.sortBy);    
    });
  }

  handlePreviousPageClick() {
    --this.currentPage;
    this.getAllReports(this.currentPage, this.searchString, this.sortBy);
  }

  handleNextPageClick() {
    ++this.currentPage;
    this.getAllReports(this.currentPage, this.searchString, this.sortBy);
  }

  handleFilterValueChange(search) {
    this.searchString = search;
    this.currentPage = 1;
    this.getAllReports(this.currentPage, this.searchString, this.sortBy);
  }

  handleSortOrderChange(column, order) {
    this.sortBy = {
      column : column,
      order : order
    }
    this.getAllReports(this.currentPage, this.searchString, this.sortBy);
    
  }

  updateData(props) {
    this.countTotalRecords(props.data)
    this.setState({
      data : props.data
    });
  }
  
  generateNewReport() {
    const {
      generateNewReport,
    } = this.props;
    
    generateNewReport(`testing/initiate`,'POST').then( (data) => {
      NotificationManager.success(data.results, '');
      this.getAllReports(this.currentPage, this.searchString, this.sortBy);   
    });
    
  }

  shouldShowReportsLoading() {
    return this.props.loader;
  }
  
  renderRepoprtsIfNeeded() {
    if (this.shouldShowReportsLoading()) {
      return this.renderCardWithInfo("Please wait while loading", "circle-o-notch", true);
    }

    return false;
  }

  renderCardWithInfo(message, iconName, spin = false) {
    
      return (
          <CardOverlay
              overlayStyle={style.overlayContainerLoader}
              textStyle={style.overlayText}
              text={(
                  <div style={style.fullWidth}>
                      <FontAwesome
                          name={iconName}
                          size="2x"
                          spin={spin}
                          />
                      <br></br>
                      {message}
                  </div>
              )}
              />
      )
  }


  render() {

    const tableData = this.state.data;
    if(!tableData) {
	    return "<p>No Data</p>";
    }

    return (
        <Panel title={'Reports'}>
          <div className="text-right" style={style.reportDiv}>
            <button type="button" style={style.reportBtn} className="btn btn-sm btn-primary" onClick={this.generateNewReport.bind(this)}><FontAwesome name='plus'></FontAwesome> New Report</button>
            <button type="button" className="btn btn-xs btn-primary" onClick={this.getAllReports.bind(this, this.currentPage, this.searchString, this.sortBy)} style={style.reloadBtn}><FontAwesome name='refresh'></FontAwesome> Reload</button>
          </div>
         {
          this.renderRepoprtsIfNeeded() ? this.renderRepoprtsIfNeeded() : (
            <div>
              <DataTables
                headerToolbarMode={"filter"}
                showRowHover={false}
                showHeaderToolbar={true}
                showHeaderToolbarFilterIcon={false}
                multiSelectable={true}
                columns={this.table_columns}
                data={tableData}
                showRowSizeControls={false}
                onNextPageClick={this.handleNextPageClick}
                onPreviousPageClick={this.handlePreviousPageClick}
                onFilterValueChange={this.handleFilterValueChange}
                onSortOrderChange={this.handleSortOrderChange}
                page={this.currentPage}
                count={this.totalData}
                rowSize={this.limit}
                tableStyle={{
                width: "inherit",
                minWidth: "100%"
                }}
                tableBodyStyle={{overflowX: "scroll"}}
              />
              
              <NotificationContainer/>
            </div>
          )
         }
  				
        </Panel>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
    const data =  state.testReducer.getIn([
      configUrl,
      ActionKeyStore.DATA
    ]);

    const loader =  state.testReducer.getIn([
      configUrl,
      ActionKeyStore.IS_FETCHING
    ])
    const props = {
      data: data ? data.toJS() : [],
      loader: loader
    };

    return props;
};

const actionCreators = (dispatch) => ({
  getReport: (configUrl, method, params) => {
    return dispatch(Actions.fetchIfNeeded(
      configUrl,
      method,
      params
    ));
  },

  deleteReport: (configUrl) => {
    return dispatch(Actions.deleteReports(
      configUrl
    ));
  },
  
  generateNewReport: (configUrl, method) => {
    return dispatch(Actions.generateNewReport(
      configUrl,
      method
    ));
  },

  goTo: function(link, context) {
   dispatch(push({pathname:link, query:context}));
  }

});

export default connect(mapStateToProps, actionCreators)(Testing);
