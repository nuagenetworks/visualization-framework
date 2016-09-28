import React from "react";
import { connect } from "react-redux";
import { push } from "redux-router";

import AppBar from "material-ui/AppBar";

import { Actions } from "./redux/actions";
import {
  Actions as ConfigurationsActions,
  ActionKeyStore as ConfigurationsActionKeyStore
} from "../../services/configurations/redux/actions"

import { theme } from "../../theme";

import ImageGraph from "../Graphs/ImageGraph";

const style = {
    navBar: {
        background: theme.palette.primary2Color,
    },
    card: {
        border: theme.palette.thinBorder + theme.palette.primary2Color,
        borderRadius: theme.palette.smallBorderRadius,
    }
};

class VisualizationView extends React.Component {

    componentWillMount() {
        this.props.fetchConfigurationIfNeeded(this.props.id);
        this.updateQuery();
    }

    componentDidUpdate(prevProps) {
        this.props.fetchConfigurationIfNeeded(this.props.id);
        this.updateQuery();
    }

    updateQuery() {
        const { configuration, fetchQueryIfNeeded } = this.props;

        if (configuration) {
            fetchQueryIfNeeded(configuration.get("query"));
        }
    }

    render() {
        const { id, configuration } = this.props;
        const title = configuration ? configuration.get("title") : "Loading...";
        return (
            <div style={style.card}>
                <AppBar
                    title={title}
                    showMenuIconButton={false}
                    style={style.navBar}
                    />
                <ImageGraph {...this.props} />
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({

    configuration: state.configurations.getIn([
        ConfigurationsActionKeyStore.VISUALIZATIONS,
        ownProps.id,
        ConfigurationsActionKeyStore.DATA
    ]),

    error: state.configurations.getIn([
        ConfigurationsActionKeyStore.VISUALIZATIONS,
        ownProps.id,
        ConfigurationsActionKeyStore.ERROR
    ])

});


const actionCreators = (dispatch) => ({
    setPageTitle: function(aTitle) {
        dispatch(Actions.updateTitle(aTitle));
    },
    goTo: function(link, filters) {
        dispatch(push({pathname:link, query:filters}));
    },
    fetchConfigurationIfNeeded: function(id) {
        dispatch(ConfigurationsActions.fetchIfNeeded(
            id,
            ConfigurationsActionKeyStore.VISUALIZATIONS
        ));
    },
    fetchQueryIfNeeded: function(id) {
        dispatch(ConfigurationsActions.fetchIfNeeded(
            id,
            ConfigurationsActionKeyStore.QUERIES
        ));
    }
 });


export default connect(mapStateToProps, actionCreators)(VisualizationView);
