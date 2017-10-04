import React, { Component } from "react";
import style from "./style";


export default class Testing extends Component {

  constructor() {
    super();

    this.state = {
    	reportsList: []
    }
    this.configApi   = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:8010/middleware/api/";
  }

  componentWillMount() {
    this.getAllReports();
  }

  getConfigApi(url) {
	   return this.configApi + url;
  }

  getAllReports() {

	fetch(this.getConfigApi("testing/reports")).then(
	  	function(response){
	      return response.json();
	    }
  	).then(jsonData => {
  	    this.setState({ reportsList: jsonData.results});

  	});
  }

  deleteReport(reportId) {

	fetch(this.getConfigApi("testing/reports/delete/"+reportId)).then(
	  	function(response){
	     return response.json();
	    }
	).then(jsonData => {
	    this.getAllReports();
	});
  }

  renderReportList() {

  	return (
	  this.state.reportsList.map((reports) =>
	  	<tr key={reports.id}>
		  <th scope="row">{reports.id}</th>
		  <td >{reports.created_at ? new Date(reports.created_at).toUTCString().replace(/\s*(GMT|UTC)$/, "") : 'N/A'}</td>
	      <td >{reports.started_at ? new Date(reports.started_at).toUTCString().replace(/\s*(GMT|UTC)$/, "") : 'N/A'}</td>
          <td >{reports.completed_at ? new Date(reports.completed_at).toUTCString().replace(/\s*(GMT|UTC)$/, "") : 'N/A'}</td>
		  <td >{reports.total}</td>
		  <td >{reports.pass}</td>
		  <td >{reports.fail}</td>
		  <td >{reports.status.toUpperCase()}</td>
		  <td>
        <a href={process.env.PUBLIC_URL +"/testing/reports/detail/"+reports.id} className="btn btn-primary btn-xs" style={{marginRight:'5px'}}><i className="fa fa-eye" aria-hidden="true"></i></a>
        <a href={process.env.PUBLIC_URL +"/testing/reports/edit/"+reports.id} className="btn btn-default btn-xs" style={{marginRight:'5px'}}><i className="fa fa-pencil-square-o" aria-hidden="true"></i></a>
  			<a href="#" className="btn btn-danger btn-xs"><i className="fa fa-trash-o" aria-hidden="true" onClick={this.deleteReport.bind(this, reports.id)}></i></a>
		  </td>
		</tr>
      )
	)

  }
  render() {
    return (
        <div className="container" style={style.overlayContainer}>
          <div style={style.header}>
			<h3>Testing Reports</h3>
		  </div>
		  <div>
        <table className="table  table-bordered">
				<thead>
				  <tr>
				    <th>#</th>
				    <th>Initiated Time</th>
				    <th>Started Time</th>
				    <th>Completed Time</th>
				    <th>Total Charts</th>
				    <th>Pass</th>
				    <th>Fail</th>
				    <th>Status</th>
				    <th>Action</th>
				  </tr>
				</thead>
				<tbody>
				  {this.renderReportList()}
				</tbody>
			  </table>
		  </div>
        </div>
    )
  }
}
