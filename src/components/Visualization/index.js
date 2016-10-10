import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { push } from "redux-router";

import AppBar from "material-ui/AppBar";
import {Card,CardText} from 'material-ui/Card';

import { Actions } from "./redux/actions";
import {
    Actions as ServiceActions,
    ActionKeyStore as ServiceActionKeyStore
} from "../../services/servicemanager/redux/actions";
import {
    Actions as ConfigurationsActions,
    ActionKeyStore as ConfigurationsActionKeyStore
} from "../../services/configurations/redux/actions";

import { resizeVisualization } from "../../utils/resize"

import { GraphManager } from "../Graphs/index";
import { ServiceManager } from "../../services/servicemanager/index";

import style from "./styles"

import FontAwesome from "react-fontawesome";


class VisualizationView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            parameterizable: true,
            hasResults: false,
        }
    }

    componentWillMount() {
        this.initialize(this.props.id);
    }

    componentDidMount() {

        // Initialize width and height properties in the state.
        this.setState(resizeVisualization(this._element));
    }

    componentWillReceiveProps(nextProps) {
        this.initialize(nextProps.id);
    }

    componentDidUpdate() {
        const {width, height} = resizeVisualization(this._element);
        if(width !== this.state.width || height !== this.state.height){
            this.setState({ width, height });
        }
    }

    initialize(id) {

        this.props.fetchConfigurationIfNeeded(id).then((c) => {
            const { configuration } = this.props

            if (!configuration)
                return;

            this.props.fetchQueryIfNeeded(configuration.get("query")).then(() => {
                const { queryConfiguration, executeQueryIfNeeded, context } = this.props;

                if (!queryConfiguration)
                    return;

                executeQueryIfNeeded(queryConfiguration, context).then(
                    () => {
                        this.setState({
                            parameterizable: true,
                        });
                    },
                    (error) => {
                        this.setState({
                            parameterizable: false,
                        });
                    },
                );
            });
        });
    }

    shouldShowVisualization() {
        const { configuration, response } = this.props;

        return configuration && response && !response.isFetching;
    }

    renderVisualization() {
        const { configuration, queryConfiguration, response } = this.props;

        const graphName      = configuration.get("graph"),
              GraphComponent = GraphManager.getGraphComponent(graphName);

        return (
            <GraphComponent
              response={response}
              configuration={configuration.toJS()}
              queryConfiguration={queryConfiguration}
              width={this.state.width}
              height={this.state.height}
            />
        )
    }

    renderVisualizationIfNeeded() {

        if (this.shouldShowVisualization()) {
            return this.renderVisualization();
        }

        if (!this.state.parameterizable) {
            return (
                <div style={style.overlayContainer}>
                    <div style={style.overlayText}>
                        <FontAwesome
                            name="meh-o"
                            size="3x"
                            />
                        <br></br>
                        Oops, we are missing some parameters here!
                    </div>
                </div>
            )
        }

        return (
            <div style={style.container}>
                <div style={style.text}>
                    <FontAwesome
                        name="circle-o-notch"
                        size="2x"
                        spin
                        />
                    <br></br>
                    Please wait while loading...
                </div>
            </div>

        )
    }

    shouldShowTitle() {
        const { configuration } = this.props;

        return configuration && configuration.get("title") && this.state.parameterizable;
    }

    renderTitleIfNeeded() {
        const { configuration } = this.props;

        if (!this.shouldShowTitle())
            return;

        return (
            <AppBar
                title={configuration.get("title")}
                showMenuIconButton={false}
                style={style.navBar}
            />
        )
    }

    cardTextReference = (c) => {
        if (this._element)
            return;

        this._element = ReactDOM.findDOMNode(c).parentElement;
    }

    render() {
        return (
            <Card
              style={style.card}
              containerStyle={style.cardContainer}
              ref={this.cardTextReference}
            >
                { this.renderTitleIfNeeded() };
                <CardText>
                    { this.renderVisualizationIfNeeded() }
                </CardText>
            </Card>
        );
    }
}

const mapStateToProps = (state, ownProps) => {

    const configurationID = ownProps.id || ownProps.params.id,
          context         = ownProps.context || ownProps.location.query;

    const props = {
        id: configurationID,
        context: context,

        configuration: state.configurations.getIn([
            ConfigurationsActionKeyStore.VISUALIZATIONS,
            configurationID,
            ConfigurationsActionKeyStore.DATA
        ]),

        error: state.configurations.getIn([
            ConfigurationsActionKeyStore.VISUALIZATIONS,
            configurationID,
            ConfigurationsActionKeyStore.ERROR
        ])

    };

    // Expose the query template as a JS object if it is available.
    if (props.configuration) {
        const queryConfiguration = state.configurations.getIn([
            ConfigurationsActionKeyStore.QUERIES,
            props.configuration.get("query")
        ]);

        if (queryConfiguration && !queryConfiguration.get(
            ConfigurationsActionKeyStore.IS_FETCHING
        )) {
            props.queryConfiguration = queryConfiguration.get(
                ConfigurationsActionKeyStore.DATA
            ).toJS();
        }

        // Expose received response if it is available
        if (props.queryConfiguration) {
            const requestID = ServiceManager.getRequestID(props.queryConfiguration, context);

            let response = state.services.getIn([
                ServiceActionKeyStore.REQUESTS,
                requestID
            ]);

            if (response && !response.get(ServiceActionKeyStore.IS_FETCHING))
                props.response = response.toJS();
        }
    }

    return props;
};


const actionCreators = (dispatch) => ({

    setPageTitle: function(aTitle) {
        dispatch(Actions.updateTitle(aTitle));
    },

    goTo: function(link, filters) {
        dispatch(push({pathname:link, query:filters}));
    },

    fetchConfigurationIfNeeded: function(id) {
        return dispatch(ConfigurationsActions.fetchIfNeeded(
            id,
            ConfigurationsActionKeyStore.VISUALIZATIONS
        ));
    },

    fetchQueryIfNeeded: function(id) {
        return dispatch(ConfigurationsActions.fetchIfNeeded(
            id,
            ConfigurationsActionKeyStore.QUERIES
        ));
    },

    executeQueryIfNeeded: function(queryConfiguration, context) {
        return dispatch(ServiceActions.fetchIfNeeded(queryConfiguration, context));
    }

 });


export default connect(mapStateToProps, actionCreators)(VisualizationView);
