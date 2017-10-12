import React, { Component } from "react";
import Collapsible from 'react-collapsible';
import { connect } from "react-redux";
import DataSets from "./DataSets.js";
import Panel from "../Common/Panel";
import { Actions, ActionKeyStore } from "./redux/actions";
import { CardOverlay } from "../CardOverlay";
import FontAwesome from "react-fontawesome";
import style from "./style";

const configUrl = 'testing/reports/';
class ReportDetails extends Component {

  componentDidMount() {
    this.getAllReports();
  }

  getAllReports() {
    const {
      getReport,
      params
    } = this.props;
    this.editMode = params.mode === 'edit';   
    getReport(`${configUrl}${params.id}`);
  }

  renderReportDetail() {
    const reports = this.props.data;
    
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
    const reports = this.props.data;
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

  shouldShowReportsLoading() {
    return this.props.loader;
  }
  
  renderRepoprtsIfNeeded() {
    if (this.shouldShowReportsLoading()) {
      return this.renderCardWithInfo("Please wait while loading", "circle-o-notch", true);
    }
    return false;
  }

  renderCardWithInfo(message, iconName, spin = false) {
    
      return (
        <CardOverlay
            overlayStyle={style.overlayContainerLoader}
            textStyle={style.overlayText}
            text={(
                <div style={style.fullWidth}>
                    <FontAwesome
                        name={iconName}
                        size="2x"
                        spin={spin}
                        />
                    <br></br>
                    {message}
                </div>
            )}
        />
      )
  }

  render() {

    if(!this.props.data) {
        return null;
    }

    return (
        <Panel title="Detailed Report">
          {
            this.renderRepoprtsIfNeeded() ? this.renderRepoprtsIfNeeded() : (
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
            )
          }
          
        </Panel>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const url =  `${configUrl}${ownProps.params.id}`;
  const data =  state.testReducer.getIn([
    url,
    ActionKeyStore.DATA
  ]);
  const loader =  state.testReducer.getIn([
    url,
    ActionKeyStore.IS_FETCHING
  ]);
  
  const props = {
    data: data ? data.toJS() : [],
    loader: loader,
    params:ownProps.params
  };

  return props;
};

const actionCreators = (dispatch) => ({

  getReport: (configUrl) => {
    return dispatch(Actions.fetchIfNeeded(
      configUrl
    ));
  }
});

export default connect(mapStateToProps, actionCreators)(ReportDetails);