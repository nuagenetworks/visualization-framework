import React, { Component } from "react";
import $ from 'jquery';
import style from "./style";


export default class DataSets extends Component {

  constructor() {

    super();
	this.configApi = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:8010/middleware/api/";

  }
  
  getConfigApi(url) {
    return this.configApi + url;
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

  renderDataSet() {

	let collaspableData = [];
	for(let response in this.props.dataset) {
		if (this.props.dataset.hasOwnProperty(response)) {
			let chartsDetails = this.props.dataset[response].charts.map((response, index)=>
			<div key={response.reportDetailId}  style={{marginTop: "20px"}}>
				<div className={index === 0 ? "" : "hide"} style={style.dataSetDescription}>
					<span style={style.dataSetDescriptionSpan}>
						<i className="fa fa-info-circle" aria-hidden="true"></i> {response.description}
					</span>
				</div>
				<div className="" style={style.dashboardTab} style={{ display: "flex"}}>
						<div className="text-center" style={{ flex: 1}}>
							<div><b>Original</b></div>
							<img style={style.chartImgWidth} role="presentation" src={'/original/'+response.chartName+'.png'} />
						</div>
						<div className="text-center" style={{ flex: 1}}>
							<div><b>Captured</b></div>
							<img style={style.chartImgWidth} role="presentation" src={'/uploads/'+response.report_id+'/'+response.dashboardsId+'/'+response.dataSetId+'/'+response.chartName+'.png'} />
						</div>

						<div  className={this.props.editAction ? "" : "hide"} style={style.isfailedBtn}>
							<div>
								<label style={style.isfailedLbl}>Failed</label>
								{response.status==="fail" ? (
							        <input type="checkbox" name="option" value={response.reportDetailId}  defaultChecked/>
							      ) : (
							        <input type="checkbox" name="option" value={response.reportDetailId}  />
							    )}
								
							</div>
						</div>
                </div>
			</div>
		);

		collaspableData.push(<div key={this.props.dataset[response].data_set_id} style={style.chartsContainer}>
         	<div className="row" style={style.dashboardTab} >
                <h4 className="panel-title" style={style.dataSetTab}>
                    <bold>{this.props.dataset[response].data_set_name}</bold>
                </h4>
    		</div>
    		{chartsDetails}
        </div>)
	  }
    }

    return collaspableData;
  }

  render() {
    return (
        <div>
			{this.renderDataSet()}
			<div className="text-center" style={{flex:"auto", marginTop: "5px"}}>
    			<button type="button" className="btn btn-primary btn-md active" onClick={this.handleSaveDataSet.bind(this,this.props.report_id,this.props.dashboard_id)}>Update</button>
            </div>          
        </div>
    )
  }
}