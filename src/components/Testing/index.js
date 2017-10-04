import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "redux-router";
import style from "./style";
import DataTables from 'material-ui-datatables';
import FontAwesome from "react-fontawesome";
import moment from "moment";

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
	    		<span className="btn btn-default btn-xs" onTouchTap={() => {this.props.goTo(`${process.env.PUBLIC_URL}/testing/reports/detail/${id}`)}}>
	    			<FontAwesome name='eye'></FontAwesome>
    			</span>
    			<span className="btn btn-primary btn-xs" onTouchTap={() => {this.props.goTo(`${process.env.PUBLIC_URL}/testing/reports/edit/${id}`)}}>
	    			<FontAwesome name='pencil'></FontAwesome>
    			</span>
    			<span className="btn btn-danger btn-xs" onTouchTap={() => {this.deleteReport(id)}}>
	    			<FontAwesome name='trash'></FontAwesome>
    			</span>
	  		</span>
	  }
	];

    this.currentPage = 1;
    this.limit = 10;
    this.filterData = false;

    this.state = {
    	data: []
    }

    this.configApi   = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:8010/middleware/api/";

    this.handlePreviousPageClick = this.handlePreviousPageClick.bind(this);
    this.handleNextPageClick     = this.handleNextPageClick.bind(this);
    this.handleSortOrderChange   = this.handleSortOrderChange.bind(this);
    this.handleFilterValueChange = this.handleFilterValueChange.bind(this);
    this.deleteReport = this.deleteReport.bind(this);
  }
  
  getConfigApi(url) {
	   return this.configApi + url;
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
    this.getAllReports();
  }

  getAllReports() {

	fetch(this.getConfigApi("testing/reports")).then(
	  	function(response){
	      return response.json();
	    }
  	).then(jsonData => {
  	    this.data = jsonData.results;
  	     /*
	     * On data change, resetting the paging and filtered data to 1 and false respectively.
	     */
	    this.resetFilters();
  	    this.updateData();
  	});
  	
  }
  
  resetFilters() {
    this.currentPage = 1;
    this.filterData = this.data;
    this.setState({ data: this.data });
  }

  deleteReport(id) {
	fetch(this.getConfigApi(`testing/reports/delete/${id}`)).then(
	  	function(response){
	     return response.json();
	    }
	).then(jsonData => {
	    this.initiate();
	});
  }

  handlePreviousPageClick() {
    --this.currentPage;
    this.updateData();
  }

  handleNextPageClick() {
    ++this.currentPage;
    this.updateData();
  }

  handleFilterValueChange(search) {

    this.resetFilters();

    this.filterData = this.data;

    if(search) {
        this.filterData = this.data.filter((d, j) => {
            let match = false;
            this.table_columns.map((column, i) => {
                if(d[column.key] && d[column.key].toString().toLowerCase().includes(search.toLowerCase()))
                   match = true;
            });

            return match;
        });
    }
    
    this.updateData();
  }

  handleSortOrderChange(column, order) {

    this.filterData = this.filterData.sort(
      (a, b) => {
        return order === 'desc' ? b[column] > a[column] : a[column] > b[column];
      }
    );

    this.updateData();
  }

  updateData() {

    let offset = this.limit * (this.currentPage - 1);

    this.setState({
        data : this.filterData.slice(offset, offset + this.limit)
    });

  }


  render() {

    const tableData = this.state.data;

    if(!tableData) {
	  return "<p>No Data</p>";
    } 

    return (
        <div className="container" style={style.overlayContainer}>
          <div style={style.header}>
			<h3>Testing Reports</h3>
		  </div>
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
				count={this.filterData.length}
				rowSize={this.limit}
				tableStyle={{
				width: "inherit",
				minWidth: "100%"
				}}
				tableBodyStyle={{overflowX: "scroll"}}
				/>
		  </div>
        </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {};
};

const actionCreators = (dispatch) => ({
  goTo: function(link, context) {
   dispatch(push({pathname:link, query:context}));
  }
});

export default connect(mapStateToProps, actionCreators)(Testing);