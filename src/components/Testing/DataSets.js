import React, { Component } from "react";
import style from "./style";
import { Button,Collapse } from 'react-bootstrap';
import $ from 'jquery';

const initialState = {
	reportsDetails : [],
	open : false,
	showMessage : false
};
let config = {
    timingCache: 5000,
    api: process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:8010/middleware/api/",
}
class DataSets extends Component {

    constructor() {
        super();
        this.state = initialState;
        this.handleSaveDataSet = this.handleSaveDataSet.bind(this);
    }

    handleSaveDataSet(reportId,dashboardId,datasetId,report_detail_id) {
    	var optionSelect = $('input[name=option_'+reportId+'_'+dashboardId+'_'+datasetId+'_'+report_detail_id+']:checked').val();
    	//var optionSelect = $('#pass_'+reportId+'_'+dashboardId+'_'+datasetId).val();
    	let url = config.api + "testing/update/reports/"+report_detail_id+'/'+optionSelect;
    	fetch(url).then(
		  	function(response){
		     return response.json();
		    }
		).then(jsonData => {
			$('#message_'+reportId+'_'+dashboardId+'_'+datasetId+'_'+report_detail_id).show();
		});
    }

    render() {
    	console.log(this.props.dataset);
    	if(this.props.dataset) {
    		var Collapsable = this.props.dataset.map((response)=>
    			<Collapse in={this.props.open} key={response.report_detail_id}>
	                  	<div className="col-sm-12">
		                 <div className="row" style={style.dashboardTab} >
			                <h4 className="panel-title alert alert-info" style={style.dataSetTab}>
			                      <bold>  {response.name} #{response.dataSetId} </bold>
			                </h4>
		            	</div>
		            	
	                   
		            	<div className="col-sm-10 col-xs-12" style={style.dashboardTab}>
							<div className="row">
								<div className="col-sm-6" style={{textAlign:"center"}}>
									<div><b>Original</b></div>
									<img style={{width: "100%"}} role="presentation" src={'/uploads/'+this.props.report_id+'/'+response.dashboard_id+'/'+response.dataSetId+'/'+response.chartName+'.png'} />
								</div>
								<div className="col-sm-6" style={{textAlign:"center"}}>
									<div><b>Captured</b></div>
									<img style={{width: "100%"}} role="presentation" src={'/uploads/'+this.props.report_id+'/'+response.dashboard_id+'/'+response.dataSetId+'/'+response.chartName+'.png'} />
								</div>
							</div>
	                    </div>
	                    
	                     <div className="col-sm-2 col-xs-12" style={{textAlign:"right"}}>
								
							<div>
								<div className="alert alert-success" id={"message_"+this.props.report_id+"_"+response.dashboard_id+"_"+response.dataSetId+"_"+response.report_detail_id} style={{textAlign:"center",display:"none"}} >
								  <strong>Saved!</strong>
								</div>
								<input type="radio" id={"pass_"+this.props.report_id+"_"+response.dashboard_id+"_"+response.dataSetId} name={"option_"+this.props.report_id+"_"+response.dashboard_id+"_"+response.dataSetId+"_"+response.report_detail_id} value="pass" />
								<label style={{marginRight: '5px'}}>Pass</label>
								<input type="radio" id={"fail_"+this.props.report_id+"_"+response.dashboard_id+"_"+response.dataSetId} name={"option_"+this.props.report_id+"_"+response.dashboard_id+"_"+response.dataSetId+"_"+response.report_detail_id} value="fail" />
								<label style={{marginRight: '5px'}}>Fail</label>
								<Button
									bsStyle="primary"
									bsSize="small"
								 	onClick={this.handleSaveDataSet.bind(this, this.props.report_id,response.dashboard_id,response.dataSetId,response.report_detail_id)}
								 >Save</Button>
							</div>
						</div>

	                    
	                </div>
	            </Collapse>
    		);
    	}
        return (
            <div>
    			{Collapsable}

            </div>
        )
    }
}

export default DataSets;
