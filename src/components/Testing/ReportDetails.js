import React, { Component } from "react";
import Collapsible from 'react-collapsible';
import DataSets from "./DataSets.js";

import Panel from "../Common/Panel";


export default class ReportDetails extends Component {

  constructor() {
    super();
    this.state = {
      reports : {}
    };

    this.configApi   = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:8010/middleware/api/";
  }

  componentWillMount() {
    this.editMode = this.props.params.mode === 'edit';
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
        reports : data.results
      });
    });
  }

  renderReportDetail() {
    const reports = this.state.reports;
    
    if(reports.dashboards) {
      return Object.keys(reports.dashboards).map(key =>
          <div key={reports.dashboards[key].dashboard_id}>
              <Collapsible trigger={reports.dashboards[key].dashboard_name}>
                  <DataSets datasets={reports.dashboards[key].datasets} editMode={this.editMode} report_id={this.props.params.id} dashboard_id={reports.dashboards[key].dashboard_id} />
              </Collapsible>
          </div>
      );
    }
  }

  renderCommonData() {
    const reports = this.state.reports;
    return (
      <div className="tab-content" style={{ border: "1px solid #ddd"}} key="mainData">
        <div id="Summary" className="tab-pane fade in active">
          <div className="panel" style={{marginBottom : 0}}>
            <table className="table table-bordered">
              <tbody>
                  <tr>
                      <td ><i className="fa fa-clock-o" aria-hidden="true"></i> Created at</td>
                      <td>{reports.created_at}</td>
                  </tr>
                  <tr>
                      <td ><i className="fa fa-clock-o" aria-hidden="true"></i> Started at</td>
                      <td>{reports.started_at}</td>
                  </tr>
                  <tr>
                      <td ><i className="fa fa-clock-o" aria-hidden="true"></i> Completed at</td>
                      <td>{reports.completed_at}</td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }



  render() {

    if(!this.state.reports) {
        return null;
    }

    return (
        <Panel title="Detailed Report">
          <div>
            <ul className="nav nav-tabs">
                <li className="active">
                  <a href={'/testing/'} className="text-success" style={{cursor:"pointer"}}>
                  <i className="fa fa-backward"></i> Back</a>
                </li>
            </ul>
            {this.renderCommonData()}
            {this.renderReportDetail()}
          </div>
        </Panel>
    )
  }
}
