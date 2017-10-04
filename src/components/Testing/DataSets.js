import React, { Component } from "react";
import $ from 'jquery';
import style from "./style";

import SubPanel from "../Common/SubPanel"
import Error from "../Common/Error"
import Infobox from "../Common/Infobox"

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

  handleSaveDataSet(report_id, dashboard_id) {

	  let selectedOption = $("input:checkbox[name=option]:checked").map(function() {return $(this).val()}).get();

	  if(!selectedOption.length)
		  selectedOption = [];

	  let params = {
		  report_detail_ids:selectedOption,
		  report_id,
		  dashboard_id
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
		  window.location.href="/testing";
	  });
  }

  getStatus(status) {
    let result = <span>Pending</span>;
    if(status == 'fail') {
      result = <span style={style.error}>Failed</span>;
    } else if(status === 'pass') {
      result = <span style={style.success}>Passed</span>;
    }

    return result;
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
  					    (<div className="text-center" style={{ flex: 5}}>

  							  <img style={style.chartImgWidth} role="presentation" src={`${this.getBaseURL()}dashboards/original/${response.dashboard_id}/${response.dataset_id ? response.dataset_id : 0}/${response.chart_name}.png`} />
  						  </div>) : null
              }
						  <div className="text-center" style={{ flex: 5}}>
							  <img style={style.chartImgWidth} role="presentation" src={`${this.getBaseURL()}dashboards/${response.report_id}/${response.dashboard_id}/${response.dataset_id ? response.dataset_id : 0}/${response.chart_name}.png`} />
						  </div>

              {
                this.props.editAction ?
  						  (<div style={style.isfailedBtn}>
  							  <div>
    								<label style={style.isfailedLbl}>Failed</label>
    								{response.chart_status === "fail" ? (
    							        <input type="checkbox" name="option" value={response.chart_id}  defaultChecked/>
    							      ) : (
    							        <input type="checkbox" name="option" value={response.chart_id}  />
    							    )}
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
