import React from "react";
import { connect } from "react-redux";
import FontAwesome from "react-fontawesome";

import { CardOverlay } from "../CardOverlay";

import {
  Actions,
  ActionKeyStore
} from "./redux/actions";

import {
  Actions as ConfigurationsActions,
  ActionKeyStore as ConfigurationsActionKeyStore
} from "../../services/configurations/redux/actions";

import style from "../Visualization/styles"


class TableScript extends React.Component {

  constructor(props) {
    super(props);
    this.isParse = false
  }

  componentWillMount() {
    this.initiate(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.initiate(nextProps)
  }

  initiate(props) {
    const {
      row,
      data,
      error,
      isFetching,
      query,
      fetchDataIfNeeded,
    } = props

    if ((!data || !data.length) && !this.isParse) {

      this.props.fetchQueryIfNeeded(query).then(() => {

        if (!this.props.queryConfiguration) {
          return
        }

        fetchDataIfNeeded(this.props.queryConfiguration, row).then(
          () => {
            this.isParse = true
          },
          (error) => {
            this.isParse = true
          }
        );
      });

    }
  }

  renderCardWithInfo(message, iconName, spin = false) {

    return (
      <CardOverlay
        overlayStyle={style.overlayContainer}
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

  renderContent() {
    return (
      <div>Content will display here</div>
    )
  }

  renderContentIfNeeded() {
    const {
      error,
      isFetching
    } = this.props;

    if (error) {
      return this.renderCardWithInfo("Oops, " + error, "meh-o");
    }

    if (isFetching) {
      return this.renderCardWithInfo("Please wait while loading", "circle-o-notch", true);
    }

    return this.renderContent()

  }


  render() {
    return (
        <div>
          { this.renderContentIfNeeded() } 
       </div>
    );
  }
}


const mapStateToProps = (state, ownProps) => {

  const rowData = JSON.stringify(ownProps.row)
  const props = {
    data: state.modalDialog.getIn([
      ActionKeyStore.MODAL_DIALOG,
      rowData,
      ActionKeyStore.RESULTS
    ]),
    fetching: true,
    error: true
  }

  let queryConfiguration = state.configurations.getIn([
    ConfigurationsActionKeyStore.QUERIES,
    ownProps.query
  ])

  if (queryConfiguration
    && queryConfiguration.get(ConfigurationsActionKeyStore.ERROR)
  ) {
    props.error = 'Not able to load data'
  }

  if (queryConfiguration
    && !queryConfiguration.get(ConfigurationsActionKeyStore.IS_FETCHING)
  ) {
    queryConfiguration = queryConfiguration.get(
      ConfigurationsActionKeyStore.DATA
    );

    props.queryConfiguration = queryConfiguration ? queryConfiguration.toJS() : null;
  }

  props.fetching = state.modalDialog.getIn([
    ActionKeyStore.MODAL_DIALOG,
    rowData,
    ActionKeyStore.IS_FETCHING
  ]),

  props.error = state.modalDialog.getIn([
    ActionKeyStore.MODAL_DIALOG,
    rowData,
    ActionKeyStore.ERROR
  ])

  return props
}

const actionCreators = (dispatch) => ({

  fetchQueryIfNeeded: function (id) {
    return dispatch(ConfigurationsActions.fetchIfNeeded(
      id,
      ConfigurationsActionKeyStore.QUERIES
    ));
  },

  fetchDataIfNeeded: function (query, row) {
    return dispatch(Actions.fetchIfNeeded(query, JSON.stringify(row)));
  }
});


export default connect(mapStateToProps, actionCreators)(TableScript);