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

    if(reports.dashboards) {
      const dashboards = Object.keys(reports.dashboards).map(key => reports.dashboards[key]);
      return dashboards.map((dashboard,index) =>
          <div key={dashboard.dashboard_id}>
              <Collapsible trigger={dashboard.dashboard_name}>
                  <DataSets datasets={dashboard.datasets} editAction={this.state.editAction} report_id={this.props.params.id} dashboard_id={dashboard.dashboard_id} />
              </Collapsible>
          </div>
      );
    }
  }


  render() {

    if(!this.state.reportsDetails) {
        return;
    }

    const reports = this.state.reportsDetails;
    console.log(reports);
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
                                    <td ><i className="fa fa-clock-o" aria-hidden="true"></i> Created At</td>
                                    <td>{reports.created_at}</td>
                                </tr>
                                <tr>
                                    <td ><i className="fa fa-clock-o" aria-hidden="true"></i> Started At</td>
                                    <td>{reports.started_at}</td>
                                </tr>
                                <tr>
                                    <td ><i className="fa fa-clock-o" aria-hidden="true"></i> Completed At</td>
                                    <td>{reports.completed_at}</td>
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
