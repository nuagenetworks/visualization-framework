import React from "react";
import ReactDOM from "react-dom";
import parse from "json-templates";
import ReactInterval from 'react-interval';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

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
                        },
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

        return configuration && response && !response.get("isFetching");
    }

    renderVisualization() {
        const { configuration, queryConfiguration, response } = this.props;

        const graphName      = configuration.get("graph"),
              GraphComponent = GraphManager.getGraphComponent(graphName);

        if (response.get("error")) {
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
        const timeout = configuration.get("refreshInterval") || 600000;

        return (
            <div>
                <ReactInterval
                    enabled={true}
                    timeout={timeout}
                    callback={() => { this.initialize(this.props.id) }}
                    />
                <GraphComponent
                  response={response.toJS()}
                  configuration={configuration.toJS()}
                  queryConfiguration={queryConfiguration.toJS()}
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

    shouldShowTitleBar() {
        const { configuration } = this.props;

        return configuration && configuration.get("title") && this.state.parameterizable;
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

    renderFilterOptions() {
        const { configuration } = this.props;

        const filterOptions = configuration.get("filterOptions");

        if (!filterOptions || filterOptions.length === 0)
            return;

        return (
            <IconMenu
                iconButtonElement={
                    <FontAwesome
                        name="ellipsis-v"
                        style={style.cardIconMenu}
                        />
                }
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                >
                {filterOptions.map((option, index) => {

                    let queryParams = Object.assign({}, this.props.context, {
                        [option.get("parameter")]: option.get("value")
                    });

                    return (
                        <MenuItem
                            key={index}
                            primaryText={option.get("label")}
                            style={style.menuItem}
                            onTouchTap={() => { this.props.goTo(window.location.pathname, queryParams)}}
                            />
                    )
                })}
            </IconMenu>
        )
    }

    renderTitleBarIfNeeded() {
        const { configuration } = this.props;

        if (!this.shouldShowTitleBar())
            return;

        return (
            <div style={style.cardTitle}>
                {configuration.get("title")}
                <div className="pull-right">
                    {this.renderDescriptionIcon()}
                    {this.renderFilterOptions()}
                </div>
            </div>
        )
    }

    cardTextReference = (c) => {
        if (this._element)
            return;

        this._element = ReactDOM.findDOMNode(c).parentElement;
    }

    render() {

        if (!this.state.parameterizable)
            return (<div></div>);

        return (
            <Card
              style={style.card}
              containerStyle={style.cardContainer}
              ref={this.cardTextReference}
            >
                { this.renderTitleBarIfNeeded() };
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
            );
        }

        const scriptName = props.configuration.get("script");

        // Expose received response if it is available
        if (props.queryConfiguration || scriptName) {
            const requestID = ServiceManager.getRequestID(props.queryConfiguration.toJS() || scriptName, context);

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
    },

    executeScriptIfNeeded: function(scriptName, context) {
        return dispatch(ServiceActions.fetchIfNeeded(scriptName, context));
    }

 });


export default connect(mapStateToProps, actionCreators)(VisualizationView);
