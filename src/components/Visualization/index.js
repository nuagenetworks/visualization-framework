import React from "react";
import ReactDOM from "react-dom";
import ReactInterval from 'react-interval';

import $ from "jquery";
import CopyToClipboard from 'react-copy-to-clipboard';

import { connect } from "react-redux";
import { Link } from "react-router";
import { push } from "redux-router";

import FiltersToolBar from "../FiltersToolBar";
import NextPrevFilter from "../NextPrevFilter";
import { CardOverlay } from "../CardOverlay";
import { Card, CardText } from 'material-ui/Card';

import {CSVLink} from 'react-csv';

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
            showSharingOptions: false
        }
    }

    componentWillMount() {
        this.initialize(this.props.id);
    }

    componentDidMount = () => {
        const {
            registerResize,
            showInDashboard
        } = this.props;

        this.updateSize();

        // If present, register the resize callback
        // to respond to interactive resizes from react-grid-layout.
        if (registerResize) {
            registerResize(this.updateSize.bind(this))
        }

        // If we show the visualization only,
        // we need to listen to window events for resizing the graph
        if (!showInDashboard)
            window.addEventListener("resize", this.updateSize);
    }

    componentWillUnmount = () => {
        const {
            showInDashboard
        } = this.props;

        // Don't forget to remove the listener here
        if (!showInDashboard)
            window.removeEventListener("resize", this.updateSize);
    }

    componentWillReceiveProps(nextProps) {
        this.initialize(nextProps.id);
    }

    componentDidUpdate() {
        this.updateSize();
    }

    updateSize = () => {
        const {
            context,
            showInDashboard
        } = this.props;

        if (this._element) {
            const { width, height } = resizeVisualization(this._element, showInDashboard, context && context.hasOwnProperty("fullScreen"));

            if (width !== this.state.width || height !== this.state.height) {
                this.setState({ width, height });
            }
        }
    }

    initialize(id) {

        this.props.fetchConfigurationIfNeeded(id).then((c) => {
            const {
                configuration,
                showInDashboard,
                setPageTitle
            } = this.props;

            if (!configuration)
                return;

            if (!showInDashboard)
                setPageTitle("Visualization");

            const queryName  = configuration.query,
                  scriptName = configuration.script;

            if (scriptName) {
                const { executeScriptIfNeeded, context } = this.props;
                executeScriptIfNeeded(scriptName, context);
            }

            if (queryName) {
                this.props.fetchQueryIfNeeded(queryName).then(() => {
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
                        }
                    );
                });
            }

            // Handle configured listeners (e.g. navigate when clicking on a bar).
            if(configuration.listeners) {
                // Use this.state.listeners to store the listeners that will be
                // passed into the visualization components.
                this.setState({

                    // This will be an object whose keys are event names,
                    // and whose values are functions that accept the data object
                    // corresponding to the clicked visual element.
                    listeners: configuration.listeners.reduce((listeners, listener) => {
                        // Use ES6 destructuring with defaults.
                        const {

                            // By default, use the "onMarkClick" event.
                            event = "onMarkClick",

                            redirect,

                            // By default, specify no additional query params.
                            params = {}
                        } = listener;

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

        return configuration && response && !response.isFetching;
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

    renderVisualization() {
        const {
            configuration,
            queryConfiguration,
            response
        } = this.props;

        const graphName      = configuration.graph,
              GraphComponent = GraphManager.getGraphComponent(graphName);

        if (response.error) {
            return this.renderCardWithInfo("Oops, " + response.error, "meh-o");
        }

        const data = ServiceManager.tabify(queryConfiguration, response.results);

        if (!data || !data.length) {
            return this.renderCardWithInfo("No data to visualize", "bar-chart");
        }

        return (
            <GraphComponent
              data={data}
              configuration={configuration}
              width={this.state.width}
              height={this.state.height}
              goTo={this.props.goTo}
              {...this.state.listeners}
            />
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

        return configuration && configuration.title && this.state.parameterizable && configuration.showTitleBar !== false;
    }

    renderDescriptionIcon() {
        const { configuration } = this.props;

        if (!configuration.description)
            return;

        return (
            <FontAwesome
                name="info"
                style={style.cardTitleIcon}
                onTouchTap={() => { this.setState({showDescription: !this.state.showDescription}); }}
                />
        )
    }

    renderShareIcon() {
        const {
            configuration,
            context
        } = this.props;

        if (!configuration || context.hasOwnProperty("fullScreen"))
            return;

        return (
            <FontAwesome
                name="share-alt"
                style={style.cardTitleIcon}
                onTouchTap={() => { this.setState({showSharingOptions: !this.state.showSharingOptions}); }}
                />
        )
    }

    renderDownloadIcon() {
        const {
            queryConfiguration,
            configuration,
            response
        } = this.props;

        if (!this.shouldShowVisualization()) {
            return false;
        }

        const data = ServiceManager.tabify(queryConfiguration, response.results);

        if (!data || !data.length) {
            return null;
        }

        return (
            <CSVLink data={data} filename={ `${configuration.title ? configuration.title : 'data'}.csv` } >
                <FontAwesome
                    name="cloud-download"
                    style={style.cardTitleIcon}
                />
            </CSVLink>
        )
    }

    renderTitleBarIfNeeded() {
        if (!this.shouldShowTitleBar())
            return;

        const {
            headerColor
        } = this.props;

        let color = Object.assign({}, style.cardTitle, headerColor ? headerColor : {});

        return (
            <div style={color}>
                <div className="pull-right">
                    {this.renderDescriptionIcon()}
                    {this.renderShareIcon()}
                    {this.renderDownloadIcon()}
                </div>
                <div>
                  {this.props.configuration.title}
                </div>

            </div>
        )
    }

    renderFiltersToolBar() {
        const {
            configuration,
            id
        } = this.props;

        if (!configuration || !configuration.filterOptions)
            return;

        return (
            <FiltersToolBar filterOptions={configuration.filterOptions} visualizationId={id} />
        )
    }

    renderNextPrevFilter() {
        const {
            configuration,
            id
        } = this.props;

        if (!configuration || !configuration.nextPrevFilter)
            return;
        
        return (
            <NextPrevFilter nextPrevFilter={configuration.nextPrevFilter} visualizationId={id} />
        )
    }

    renderSharingOptions () {
        if (!this.state.showSharingOptions)
            return;

        const {
            configuration,
            context
        } = this.props;


        const queryParams = Object.assign({}, context, {fullScreen:null});
        const queryString = $.param(queryParams);
        const iframeText = "<iframe src=\"" + window.location.origin + "/reports/visualizations/" + configuration.id + "?" + queryString + "\" width=\"800\" height=\"600\"></iframe>";

        return (
            <div
                className="text-center"
                style={style.sharingOptionsContainer}
                >
                <CopyToClipboard
                    text={iframeText}
                    style={style.copyContainer}
                    >
                    <button className="btn btn-default btn-xs">
                         <FontAwesome name="copy" /> Copy iframe source
                    </button>
                </CopyToClipboard>&nbsp;

                <Link
                    style={style.cardTitleIcon}
                    to={{ pathname:"/reports/visualizations/" + configuration.id, query: queryParams }}
                    target="_blank"
                    >
                    <button className="btn btn-default btn-xs">
                         <FontAwesome name="external-link" /> Open new window
                    </button>
                </Link>
            </div>
        )
    }

    cardTextReference = (c) => {
        if (this._element)
            return;

        this._element = ReactDOM.findDOMNode(c).parentElement;
    }

    render() {
        const {
            configuration,
            context
        } = this.props;

        if (!this.state.parameterizable || !configuration)
            return (<div></div>);

        let description;

        if (this.state.showDescription) {
            description = <CardOverlay
                                overlayStyle={style.descriptionContainer}
                                textStyle={style.descriptionText}
                                text={configuration.description}
                                onTouchTapOverlay={() => { this.setState({showDescription: false}); }}
                                />
        }


        let cardText = Object.assign({}, style.cardText, {
            width: this.state.width,
            height: this.state.height
        });

        const configStyle = configuration.styles || {};

        let refreshInterval = context.refreshInterval,
            timeout         = parseInt(configuration.refreshInterval || refreshInterval, 10),
            enabled         = refreshInterval > 0;

        return (
            <Card
              style={Object.assign({}, style.card, configStyle.card)}
              containerStyle={style.cardContainer}
              ref={this.cardTextReference}
            >
                { this.renderTitleBarIfNeeded() }

                { this.renderNextPrevFilter() }
                { this.renderFiltersToolBar() }
                <div>
                    { this.renderSharingOptions() }
                    <CardText style={cardText}>
                        { this.renderVisualizationIfNeeded() }
                        {description}
                        <ReactInterval
                            enabled={enabled}
                            timeout={timeout}
                            callback={() => { this.initialize(this.props.id) }}
                            />
                    </CardText>
                </div>
            </Card>
        );
    }
}

const updateFilterOptions = (state, configurations, context) => {
  if(configurations && configurations.filterOptions) {
    for(let key in configurations.filterOptions) {
        if(configurations.filterOptions[key].type) {
          if(context && context.enterpriseID) {
             let nsgs = state.services.getIn([ServiceActionKeyStore.REQUESTS, `enterprises/${context.enterpriseID}/${configurations.filterOptions[key].name}`, ServiceActionKeyStore.RESULTS]);

             if(nsgs && nsgs.length) {
               configurations.filterOptions[key].options = [];
               configurations.filterOptions[key].default = nsgs[0].name;

               nsgs.forEach((nsg) => {
                 configurations.filterOptions[key].options.push({
                   label: nsg.name,
                   value: nsg.name
                 });
               });
             }
          }
        }
    };
  }
  return configurations;
}

const mapStateToProps = (state, ownProps) => {

    const configurationID = ownProps.id || ownProps.params.id,
          orgContexts = state.interface.get(InterfaceActionKeyStore.CONTEXT),
          configuration = state.configurations.getIn([
              ConfigurationsActionKeyStore.VISUALIZATIONS,
              configurationID,
              ConfigurationsActionKeyStore.DATA
          ]);

    let context = {};
    for (let key in orgContexts) {
      if(orgContexts.hasOwnProperty(key)) {
        let filteredKey = key.replace(`${configurationID}-`, '');
        if(!context[filteredKey] || key.includes(`${configurationID}-`))
            context[filteredKey] = orgContexts[key];
      }
    }
    
    const props = {
        id: configurationID,
        context: context,
        configuration: configuration ? contextualize(configuration.toJS(), context) : null,
        headerColor: state.interface.getIn([InterfaceActionKeyStore.HEADERCOLOR, configurationID]),
        error: state.configurations.getIn([
            ConfigurationsActionKeyStore.VISUALIZATIONS,
            configurationID,
            ConfigurationsActionKeyStore.ERROR
        ])
    };

    let vizConfig =  configuration ? contextualize(configuration.toJS(), context) : null;
    props.configuration = updateFilterOptions(state, vizConfig, context);

    // Expose the query template as a JS object if it is available.
    if (configuration) {
        let queryConfiguration = state.configurations.getIn([
            ConfigurationsActionKeyStore.QUERIES,
            configuration.get("query")
        ]);

        if (queryConfiguration && !queryConfiguration.get(
            ConfigurationsActionKeyStore.IS_FETCHING
        )) {
            queryConfiguration = queryConfiguration.get(
                ConfigurationsActionKeyStore.DATA
            );

            props.queryConfiguration = queryConfiguration ? queryConfiguration.toJS() : null;
        }

        const scriptName = configuration.get("script");

        // Expose received response if it is available
        if (props.queryConfiguration || scriptName) {
            const query = props.queryConfiguration ? props.queryConfiguration : scriptName;
            const requestID = ServiceManager.getRequestID(query, context);

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
        dispatch(InterfaceActions.updateTitle(aTitle));
    },

    goTo: function(link, context) {
        dispatch(push({pathname:link, query:context}));
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
