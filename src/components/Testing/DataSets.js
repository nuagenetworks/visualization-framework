import React, { Component } from "react";
import { connect } from "react-redux";
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import style from "./style";
import SubPanel from "../Common/SubPanel"
import Error from "../Common/Error"
import Infobox from "../Common/Infobox"
import Image from "./Image";
import { Actions } from "./redux/actions";

class DataSets extends Component {

  getBaseURL() {
    return "http://localhost:8010/";
  }

  handleSaveDataSet(chart_id, report_id, report_dashboard_id) {

	  let params = {
		  chart_id:chart_id,
      report_id : report_id,
      report_dashboard_id : report_dashboard_id
    }
    
    const {
      updateDataSet,
    } = this.props;

    updateDataSet(`testing/update/reports`,'POST', params).then( (data) => {
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
    let styles1 = {
      backgroundColor: 'rgb(160, 160, 160)',
      color: 'white',
      textAlign: 'center',
      padding: '10px',
    };
    console.log('===',datasets);
	  for(let datasetID in datasets) {
	 	  if (datasets.hasOwnProperty(datasetID)) {
        
        let graphType;
			  let chartsDetails = datasets[datasetID].charts.map((response, index) => {
          let check = 0;
          if(graphType !== response.graph_type) {
            graphType = response.graph_type;
            check=1;
          }
			    return (<div key={response.chart_id}  style={{marginTop: "20px"}}>
            {index === 0 && response.graph_type==='before_click' ? (<div style={styles1} >Before Click</div>) : null }
            {check === 1 && response.graph_type==='after_click' ? (<div style={styles1} >After Click</div>) : null }
				    <div className="" style={{ display: "flex"}}>
              {response.dataset_file}
              { datasets[datasetID].dataset_id && response.graph_type==='before_click' ? 
  					    (
                  <Image data={`${this.getBaseURL()}dashboards/original/${response.dashboard_id}/${response.dataset_id ? response.dataset_id : 0}/${response.chart_name}.png`}  />
                ) : 
                (
                  <Image data={`${this.getBaseURL()}dashboards/original/${response.dashboard_id}/${response.dataset_id ? response.dataset_id : 0}/bar/${response.chart_name}.png`}  />
                )
              }
              { response.graph_type==='before_click' ? 
                (
                  <Image data={`${this.getBaseURL()}dashboards/${response.report_id}/${response.dashboard_id}/${response.dataset_id ? response.dataset_id : 0}/${response.chart_name}.png`}  />
                )
                :
                (
                  <Image data={`${this.getBaseURL()}dashboards/${response.report_id}/${response.dashboard_id}/${response.dataset_id ? response.dataset_id : 0}/bar/${response.chart_name}.png`}  />
                )
              }
              
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
          </div>)

          }
		    );

		    collaspableData.push(
          <SubPanel key={datasets[datasetID].dataset_id} title={datasets[datasetID].dataset_name ? datasets[datasetID].dataset_name : 'Standard'}>
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

const mapStateToProps = (state, ownProps) => ({
  
});

const actionCreators = (dispatch) => ({

  updateDataSet: (configUrl, method, params) => {
    return dispatch(Actions.updateDataSet(
      configUrl,
      method,
      params
    ));
  }
});

export default connect(mapStateToProps, actionCreators)(DataSets);