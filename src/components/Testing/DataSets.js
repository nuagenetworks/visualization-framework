import React, { Component } from "react";
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import style from "./style";

import SubPanel from "../Common/SubPanel"
import Error from "../Common/Error"
import Infobox from "../Common/Infobox"
import Image from "./Image"
export default class DataSets extends Component {

  constructor() {
    super();
  	this.configApi = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:8010/middleware/api/";
  }

  getConfigApi(url) {
    return this.configApi + url;
  }

  getBaseURL() {
    return "http://localhost:8010/";
  }

  handleSaveDataSet(chart_id, report_id, report_dashboard_id) {

	  let params = {
		  chart_id:chart_id,
      report_id : report_id,
      report_dashboard_id : report_dashboard_id
	  }

    fetch(this.getConfigApi("testing/update/reports"), {
		  method: 'post',
		  headers: new Headers({
			  'Content-Type': 'application/json'
		  }),
		  body: JSON.stringify(params)
	  }).then(function(response) {
		  return response.json();
	  }).then(function(data) {
      NotificationManager.success('Successfully Updated', '');
	  });
  }

  getStatus(status) {
    let result = <span>Pending</span>;
    if(status === 'fail') {
      result = <span style={style.error}>Failed</span>;
    } else if(status === 'pass') {
      result = <span style={style.success}>Passed</span>;
    }

    return result;
  }

  getActionCheckbox(status, chart_id, report_id, report_dashboard_id) {
    let action;
    if(status === 'fail') {
      action = <input type="checkbox" name="option" value={chart_id} onClick={this.handleSaveDataSet.bind(this,chart_id, report_id, report_dashboard_id)}  defaultChecked/>;
    } else {
      action = <input type="checkbox" name="option" value={chart_id} onClick={this.handleSaveDataSet.bind(this,chart_id, report_id, report_dashboard_id)} />;
    }

    return action;   
  }

  renderDataSet() {
  	let collaspableData = [];
    let datasets = this.props.datasets;
	  for(let datasetID in datasets) {
	 	  if (datasets.hasOwnProperty(datasetID)) {
			  let chartsDetails = datasets[datasetID].charts.map((response, index) =>
			    <div key={response.chart_id}  style={{marginTop: "20px"}}>
				    <div className="" style={style.dashboardTab} style={{ display: "flex"}}>
              {datasets[datasetID].dataset_id ? 
  					    (
                  <Image data={`${this.getBaseURL()}dashboards/original/${response.dashboard_id}/${response.dataset_id ? response.dataset_id : 0}/${response.chart_name}.png`}  />
                ) : null
              }
              <Image data={`${this.getBaseURL()}dashboards/${response.report_id}/${response.dashboard_id}/${response.dataset_id ? response.dataset_id : 0}/${response.chart_name}.png`}  />
              {
                this.props.editMode ?
  						  (<div style={style.isfailedBtn}>
  							  <div>
    								<label style={style.isfailedLbl}>Failed</label>
    								{this.getActionCheckbox(response.chart_status, response.chart_id, response.report_id, response.report_dashboard_id)}
  							  </div>
  						  </div>) :
                (
                  <div style={{ flex: 1, textAlign: "right" }}>
                    {this.getStatus(response.chart_status)}
                  </div>
                )
              }
           </div>
           <hr />
			  </div>
		    );

		    collaspableData.push(
          <SubPanel key={datasets[datasetID].dataset_name} title={datasets[datasetID].dataset_name ? datasets[datasetID].dataset_name : 'Standard'}>
              <Infobox data={datasets[datasetID].dataset_description} />
              <Error data={datasets[datasetID].errors}></Error>
              {chartsDetails}
              <NotificationContainer/>
          </SubPanel>
        );
	    }
    }

    return collaspableData;
  }

  render() {
    return (
      <div>
			  {this.renderDataSet()}
      </div>
    )
  }
}
