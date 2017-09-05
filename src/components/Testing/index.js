import React, { Component } from "react";
import style from "./style";

const initialState = {
	reportsList : []
};
let config = {
    timingCache: 5000,
    api: process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:8010/middleware/api/",
}
class Testing extends Component {
    
    constructor() {
        super();
        this.state = initialState;
        this.deleteReport = this.deleteReport.bind(this);
    }

    componentDidMount() {
        this.getAllReports();
    }

    getAllReports() {
    	let url = config.api + "testing/reports";
    	fetch(url).then(
		  	function(response){
		     return response.json();
		    }
		).then(jsonData => {
		    this.setState({
		    	reportsList : jsonData.results
		    });
		});	
    }

    deleteReport(reportId) {
    	let url = config.api + "testing/reports/delete/"+reportId;
    	fetch(url).then(
		  	function(response){
		     return response.json();
		    }
		).then(jsonData => {
		    this.getAllReports();
		});
    }

    render() {
    	
    	const tableItems = this.state.reportsList.map((reports) =>
		  	<tr key={reports.id}>
				<th scope="row">{reports.id}</th>
				<td >{reports.created_at}</td>
				<td >{reports.start_time}</td>
				<td >{reports.end_time}</td>
				<td >{reports.total}</td>
				<td >{reports.pass}</td>
				<td >{reports.fail}</td>
				<td >{reports.status.toUpperCase()}</td>
				<td>
					<a href={process.env.PUBLIC_URL +"/testing/reports/edit/"+reports.id} className="btn btn-default btn-xs" style={{marginRight:'5px'}}><i className="fa fa-pencil-square-o" aria-hidden="true"></i></a>
					<a href={process.env.PUBLIC_URL +"/testing/reports/detail/"+reports.id} className="btn btn-primary btn-xs" style={{marginRight:'5px'}}><i className="fa fa-eye" aria-hidden="true"></i></a>
					<a href="#" className="btn btn-danger btn-xs"><i className="fa fa-trash-o" aria-hidden="true" onClick={this.deleteReport.bind(this, reports.id)}  ></i></a>
				</td>
			</tr>
		);
		
        return (
            
            <div className="container" style={style.overlayContainer}>
            
            	<div className="col-sm-12"  style={style.header}>
				  <h3>Testing Reports</h3>
				</div>
				<div>
	                <table className="table  table-bordered">
					  <thead>
					    <tr>
					      <th>#</th>
					      <th>Date</th>
					      <th>Start Time</th>
					      <th>End Time</th>				      
					      <th>Total Charts</th>
					      <th>Pass</th>
					      <th>Fail</th>
					      <th>Status</th>
					      <th>Action</th>
					    </tr>
					  </thead>
					  <tbody>
					    {tableItems}
					  </tbody>
					</table>
				</div>
            </div>
        )
    }
}

export default Testing;
