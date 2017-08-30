import React, { Component } from "react";
import style from "./style";
//import { Button,Collapse } from 'react-bootstrap';
import DataSets from "./DataSets.js";

const initialState = {
	reportsDetails : [],
	open : false
};
let config = {
    timingCache: 5000,
    api: process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:8010/middleware/api/",
}
class ReportDetails extends Component {

    constructor() {
        super();
        this.state = initialState;
    }

    componentDidMount() {
        this.getAllReports();
    }

    getAllReports() {
    	//alert(config.api);
    	let url = config.api + "testing/reports/"+this.props.params.id;
    	fetch(url).then(
		  	function(response){
		     return response.json();
		    }
		).then(jsonData => {
		    this.setState({
		    	reportsDetails : jsonData.results
		    });
		});

    }

    render() {
    	//console.log(this.state.reportsDetails);
    	if(this.state.reportsDetails) {

	    	var Details = this.state.reportsDetails.map((res) =>

	    		<div key={res.count}>
		    		<div className="col-lg-12 col-md-12">
                        <ul className="nav nav-tabs">
                            <li className="active"><a data-toggle="tab" href="#Summery" className="text-success"><i className="fa fa-indent"></i> Summery</a></li>
                        </ul>
                        <div className="tab-content">
                            <div id="Summery" className="tab-pane fade in active">
                                <div className="table-responsive panel">
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <td className="text-success"><i className="fa fa-clock-o" aria-hidden="true"></i> Date</td>
                                                <td>{res.created_at}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-success"><i className="fa fa-clock-o" aria-hidden="true"></i> Start Time</td>
                                                <td>{res.start_time}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-success"><i className="fa fa-clock-o" aria-hidden="true"></i> End Time</td>
                                                <td>{res.end_time}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
	                </div>
		    		<div  className="col-lg-12 col-md-12" style={style.tab} >
			    		<div className="panel-heading " style={style.dashboardTab} onClick={ ()=> this.setState({ open: !this.state.open })}>
			                <h4 className="panel-title">
			                    <a href="#" >
			                        <i className="more-less glyphicon glyphicon-plus"></i>
			                        {res.dashboardname} #{res.dashboardId}
			                    </a>
			                </h4>
			            </div>
		            </div>
		            <DataSets dataset={res.dataset} open={this.state.open} report_id={res.report_id} />
	            </div>
	    	);

   		}
        return (
            <div style={style.overlayContainer}>


                {Details}

            </div>
        )
    }
}

export default ReportDetails;
