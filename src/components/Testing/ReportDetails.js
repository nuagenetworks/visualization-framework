import React, { Component } from "react";
import Collapsible from 'react-collapsible';
import style from "./style";
import DataSets from "./DataSets.js";


export default class ReportDetails extends Component {

  constructor() {
    super();
    this.state = {
      reportsDetails : [],
      editAction:false
    };

    this.configApi   = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:8010/middleware/api/";
  }

  componentWillMount() {

    const splitUrl = window.location.pathname.split('/');
    if(splitUrl[3] === "edit") {
      this.setState({ editAction : true });
    }

    this.getAllReports();
  }

  getConfigApi(url) {
    return this.configApi + url;
  }

  getAllReports() {
    fetch(this.getConfigApi("testing/reports/"+this.props.params.id)).then(
      function(response){
        return response.json();
      }
    ).then(data => {
      this.setState({
        reportsDetails : data.results
      });
    });
  }

  renderReportDetail() {
    
    const reports = this.state.reportsDetails;
    if(reports.data) {

      const dashboard_details = Object.keys(reports.data).map( s => reports.data[s]);

      return ( dashboard_details.map((res,index) =>

                <div key={res.dashboard_id}>
                    <Collapsible trigger={res.dashboard_name}>
                            <DataSets dataset={res.datasets} editAction={this.state.editAction} report_id={res.report_id} dashboard_id={res.dashboard_id} />
                    </Collapsible>
                </div>
            )
      );
    }
  }


  render() {

    if(!this.state.reportsDetails) {
        return;
    }

    const reports = this.state.reportsDetails;
    return (
        <div className="container" style={style.overlayContainer}>
            <div className="text-center">
                <h2>Report Detail</h2>
            </div>
            <ul className="nav nav-tabs">
                <li className="active"><a href={'/testing/'} className="text-success" style={{cursor:"pointer"}}><i className="fa fa-backward"></i> Back</a></li>
            </ul>
            <div className="tab-content" style={{ border: "1px solid #ddd"}}>
                <div id="Summary" className="tab-pane fade in active">
                    <div className="panel" style={{marginBottom : 0}}>
                        <table className="table table-bordered">
                            <tbody>
                                <tr>
                                    <td ><i className="fa fa-clock-o" aria-hidden="true"></i> Start Time</td>
                                    <td>{new Date(reports.start_time).toUTCString().replace(/\s*(GMT|UTC)$/, "")}</td>
                                </tr>
                                <tr>
                                    <td ><i className="fa fa-clock-o" aria-hidden="true"></i> End Time</td>
                                    <td>{new Date(reports.end_time).toUTCString().replace(/\s*(GMT|UTC)$/, "")}</td>
                                </tr>
                                
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {this.renderReportDetail()}
        </div>
    )
  }
}
