import React from "react";
import ReactDOM from "react-dom";
import parse from "json-templates";

import { fromJS, Map } from "immutable";

import { connect } from "react-redux";
import { push } from "redux-router";

import { CardOverlay } from "../CardOverlay";
import { Card, CardText } from 'material-ui/Card';

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
            showDescription: false,
        }
    }

    componentWillMount() {
        this.initialize(this.props.id);
    }

    componentDidMount() {
        this.updateSize();

        // If present, register the resize callback
        // to respond to interactive resizes from react-grid-layout.
        if (this.props.registerResize) {
            this.props.registerResize(this.updateSize.bind(this))
        }
    }

    componentWillReceiveProps(nextProps) {
        this.initialize(nextProps.id);
    }

    componentDidUpdate() {
        this.updateSize();
    }

    updateSize() {
        if (this._element) {
            const { width, height } = resizeVisualization(this._element);

            if (width !== this.state.width || height !== this.state.height) {
                this.setState({ width, height });
            }
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

            // Handle configured listeners (e.g. navigate when clicking on a bar).
            if(configuration.get("listeners")){

                // Use this.state.listeners to store the listeners that will be
                // passed into the visualization components.
                this.setState({

                    // This will be an object whose keys are event names,
                    // and whose values are functions that accept the data object
                    // corresponding to the clicked visual element.
                    listeners: configuration.get("listeners").reduce((listeners, listener) => {
                        // Use ES6 destructuring with defaults.
                        const {

                            // By default, use the "onMarkClick" event.
                            event = "onMarkClick",

                            // By default, stay on the current route.
                            redirect = window.location.pathname,

                            // By default, specify no additional query params.
                            params = {}
                        } = listener.toJS();

                        // Each listener expects the data object `d`,
                        // which corresponds to a row of data visualized.
                        listeners[event] = (d) => {

                            // Compute the query params from the data object.
                            let queryParams = Object.keys(params)
                                .reduce((queryParams, destinationParam) => {
                                    const sourceColumn = params[destinationParam];
                                    queryParams[destinationParam] = d[sourceColumn];
                                    return queryParams;
                                }, {});

                            // Override the existing context with the new params.
                            queryParams = Object.assign({}, this.props.context, queryParams);

                            // Perform the navigation via react-router.
                            this.props.goTo(redirect, queryParams);
                        };

                        return listeners;
                    }, {})
                });
            }
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

        if (response.error) {
            return (
                <CardOverlay
                    overlayStyle={style.overlayContainer}
                    textStyle={style.overlayText}
                    text={(
                        <div>
                            <FontAwesome
                                name="meh-o"
                                size="2x"
                                />
                            <br></br>
                            Wow, it seems the connection is lost!
                        </div>
                    )}
                    />
            )
        }

        let description;

        if (this.state.showDescription) {
            description = <CardOverlay
                                overlayStyle={style.descriptionContainer}
                                textStyle={style.descriptionText}
                                text={configuration.get("description")}
                                onTouchTapOverlay={() => { this.setState({showDescription: false}); }}
                                />
        }

        return (
            <div>
                <GraphComponent
                  response={response}
                  configuration={configuration.toJS()}
                  queryConfiguration={queryConfiguration}
                  width={this.state.width}
                  height={this.state.height}
                  {...this.state.listeners}
                />
                {description}
            </div>
        )
    }

    renderVisualizationIfNeeded() {
        if (this.shouldShowVisualization()) {
            return this.renderVisualization();
        }

        if (!this.state.parameterizable) {
            return (
                <CardOverlay
                    overlayStyle={style.overlayContainer}
                    textStyle={style.overlayText}
                    text={(
                        <div>
                            <FontAwesome
                                name="meh-o"
                                size="2x"
                                />
                            <br></br>
                            Oops, we are missing some parameters here!
                        </div>
                    )}
                    onTouchTapOverlay={() => { this.setState({showDescription: false}); }}
                    />
            )
        }

        return (
            <CardOverlay
                overlayStyle={style.overlayContainer}
                textStyle={style.overlayText}
                text={(
                    <div>
                        <FontAwesome
                            name="circle-o-notch"
                            spin
                            />
                        <br></br>
                        Please wait while loading
                    </div>
                )}
                />
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

        const descriptionIcon = !configuration.get("description") ? null : (
            <div className="pull-right">
                <FontAwesome
                    name="info-circle"
                    onTouchTap={() => { this.setState({showDescription: !!configuration.get("description")}); }}
                    />
            </div>
        )

        return (
            <div style={style.cardTitle}>
                {configuration.get("title")}
                {descriptionIcon}
            </div>
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
                <CardText style={style.cardText}>
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
