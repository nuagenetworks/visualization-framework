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
		    		<div className="">
                        <ul className="nav nav-tabs" style={{ border: "none"}}>
                            <li className="active"><a data-toggle="tab" href="#Summary" className="text-success"><i className="fa fa-indent"></i> Summary</a></li>
                        </ul>
                        <div className="tab-content" style={{ border: "1px solid #ddd"}}>
                            <div id="Summary" className="tab-pane fade in active">
                                <div className="panel" style={{marginBottom : 0}}>
                                    <table className="table table-bordered">
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
                                            <tr>
                                                <td className="text-success" colSpan="2">
	                                                <div className="panel-heading " style={style.dashboardTab} onClick={ ()=> this.setState({ open: !this.state.open })}>
										                <h4>
										                    <a href="#" >
										                        <i className="more-less glyphicon glyphicon-plus"></i>
										                        {res.dashboardname} #{res.dashboardId}
										                    </a>
										                </h4>
										            </div>
                                                
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
	                </div>
		            <DataSets dataset={res.dataset} open={this.state.open} report_id={res.report_id} />
	            </div>
	    	);

   		}
        return (
            <div className="container" style={style.overlayContainer}>


                {Details}

            </div>
        )
    }
}

export default ReportDetails;
