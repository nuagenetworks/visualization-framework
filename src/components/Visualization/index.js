import React from "react";
import ReactDOM from "react-dom";
import ReactInterval from 'react-interval';

import { connect } from "react-redux";
import { push } from "redux-router";

import FiltersToolBar from "../FiltersToolBar";
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

import {
    Actions as InterfaceActions,
    ActionKeyStore as InterfaceActionKeyStore,
} from "../App/redux/actions";

import { resizeVisualization } from "../../utils/resize"
import { contextualize } from "../../utils/configurations"

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

            const queryName  = configuration.get("query"),
                  scriptName = configuration.get("script");

            if (scriptName) {
                const { executeScriptIfNeeded, context } = this.props;
                executeScriptIfNeeded(scriptName, context);
            }

            if (queryName) {
                this.props.fetchQueryIfNeeded(queryName).then(() => {
                    const { queryConfiguration, executeQueryIfNeeded, context } = this.props;

                    if (!queryConfiguration)
                        return;

                    executeQueryIfNeeded(queryConfiguration.toJS(), context).then(
                        () => {
                            this.setState({
                                parameterizable: true,
                            });
                        },
                        (error) => {
                            this.setState({
                                parameterizable: false,
                            });
                        }
                    );
                });
            }

            // Handle configured listeners (e.g. navigate when clicking on a bar).
            if(configuration.get("listeners")) {
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

                            redirect,

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

                            let url;

                            // By default, stay on the current route.
                            if (!redirect)
                                url = window.location.pathname;
                            else
                                url = process.env.PUBLIC_URL + redirect;

                            // Perform the navigation via react-router.
                            this.props.goTo(url, queryParams);
                        };

                        return listeners;
                    }, {})
                });
            }
        });
    }

    shouldShowVisualization() {
        const { configuration, response } = this.props;

        return configuration && response && !response.get("isFetching");
    }

    renderCardWithInfo(message, iconName, spin = false) {
        return (
            <CardOverlay
                overlayStyle={style.overlayContainer}
                textStyle={style.overlayText}
                text={(
                    <div>
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

    renderVisualization() {
        const {
            configuration,
            context,
            queryConfiguration,
            response
        } = this.props;

        const graphName      = configuration.get("graph"),
              GraphComponent = GraphManager.getGraphComponent(graphName);

        const currentResponse = response.toJS();

        if (currentResponse.error) {
            return this.renderCardWithInfo("Oops, " + currentResponse.error, "meh-o");
        }

        const data = ServiceManager.tabify(queryConfiguration, currentResponse.results);

        if (!data || !data.length) {
            return this.renderCardWithInfo("No data to visualize", "bar-chart");
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

        const refreshInterval = context.refreshInterval,
              timeout         = configuration.get("refreshInterval") || refreshInterval,
              enabled         = refreshInterval > 0;

        return (
            <div>
                <ReactInterval
                    enabled={enabled}
                    timeout={timeout}
                    callback={() => { this.initialize(this.props.id) }}
                    />
                <GraphComponent
                  data={data}
                  configuration={configuration.toJS()}
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

        return this.renderCardWithInfo("Please wait while loading", "circle-o-notch", true);
    }

    shouldShowTitleBar() {
        const { configuration } = this.props;

        return configuration && this.currentTitle() && this.state.parameterizable && configuration.get("showTitleBar") !== false;
    }

    currentTitle() {
        const { configuration, context } = this.props;
        const title = configuration.get("title");

        if (!title)
            return ;

        return contextualize(title, context);
    }

    renderDescriptionIcon() {
        const { configuration } = this.props;

        if (!configuration.get("description"))
            return;

        return (
            <FontAwesome
                name="info-circle"
                style={style.cardIconMenu}
                onTouchTap={() => { this.setState({showDescription: !!configuration.get("description")}); }}
                />
        )
    }

    renderTitleBarIfNeeded() {
        if (!this.shouldShowTitleBar())
            return;

        return (
            <div style={style.cardTitle}>
                {this.currentTitle()}
                <div className="pull-right">
                    {this.renderDescriptionIcon()}
                </div>
            </div>
        )
    }

    renderFiltersToolBar() {
        const { configuration } = this.props;

        if (!configuration || !configuration.get("filterOptions"))
            return;

        return (
            <FiltersToolBar filterOptions={configuration.get("filterOptions").toJS()} />
        )
    }

    cardTextReference = (c) => {
        if (this._element)
            return;

        this._element = ReactDOM.findDOMNode(c).parentElement;
    }

    render() {
        if (!this.state.parameterizable || !this.props.configuration)
            return (<div></div>);

        const {
            configuration
        } = this.props;

        var configStyle = configuration.get("styles") ? configuration.get("styles").toJS() : {};

        return (
            <Card
              style={Object.assign({}, style.card, configStyle.card)}
              containerStyle={style.cardContainer}
              ref={this.cardTextReference}
            >
                { this.renderTitleBarIfNeeded() }
                { this.renderFiltersToolBar() }
                <CardText style={style.cardText}>
                    { this.renderVisualizationIfNeeded() }
                </CardText>
            </Card>
        );
    }
}

const mapStateToProps = (state, ownProps) => {

    const configurationID = ownProps.id || ownProps.params.id,
          context         = state.interface.get(InterfaceActionKeyStore.CONTEXT);

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
            );
        }

        const scriptName = props.configuration.get("script");

        // Expose received response if it is available
        if (props.queryConfiguration || scriptName) {
            const query = props.queryConfiguration ? props.queryConfiguration.toJS() : scriptName;
            const requestID = ServiceManager.getRequestID(query, context);

            let response = state.services.getIn([
                ServiceActionKeyStore.REQUESTS,
                requestID
            ]);
            if (response && !response.get(ServiceActionKeyStore.IS_FETCHING))
                props.response = response;
        }
    }

    return props;
};


const actionCreators = (dispatch) => ({

    setPageTitle: function(aTitle) {
        dispatch(Actions.updateTitle(aTitle));
    },

    goTo: function(link, context) {
        dispatch(InterfaceActions.updateContext(context));
        dispatch(push({pathname:link}));
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
    },

    executeScriptIfNeeded: function(scriptName, context) {
        return dispatch(ServiceActions.fetchIfNeeded(scriptName, context));
    }

 });


export default connect(mapStateToProps, actionCreators)(VisualizationView);
