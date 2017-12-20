import React from "react";
import ReactDOM from "react-dom";
import ReactInterval from 'react-interval';
import evalExpression from "eval-expression"

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
import * as d3 from "d3";

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

        //If tooltip is not moving then we will fetch the data again, else there is no need for it
        if(nextProps.tooltip.default.origin === null
        || JSON.stringify(nextProps.tooltip.default) === JSON.stringify(this.props.tooltip.default)) {
            this.initialize(nextProps.id)
        }
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

                const queries =  typeof queryName === 'string' ? {'data' : queryName} : queryName

                for(let query in queries) {
                    if (queries.hasOwnProperty(query)) {
                        this.props.fetchQueryIfNeeded(queries[query]).then(() => {

                            const { queryConfigurations, executeQueryIfNeeded, context } = this.props;

                            if(!queryConfigurations[query]) {
                                return
                            }

                            executeQueryIfNeeded(queryConfigurations[query], context).then(
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
                }
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

                            // By default, specify no date params.
                            dateParams = false,

                            // By default, specify no additional query params.
                            params = {}
                        } = listener;

                        // Each listener expects the data object `d`,
                        // which corresponds to a row of data visualized.
                        listeners[event] = (d) => {

                            let graphQueryParams = {};
                            let resetFilters = false;

                            if(configuration.key) {
                                let vizID = `${id.replace(/-/g, '')}vkey`;
                                let vKey = evalExpression("(" + configuration.key + ")")(d);
                                if(this.props.orgContext[vizID] === vKey)
                                    resetFilters = true;

                                graphQueryParams[vizID] = vKey;
                            }


                            if(dateParams) {
                                let filteredID = (dateParams.reference).replace(/-/g, '');
                                graphQueryParams[`${filteredID}endTime`] = +d[dateParams.column] + dateParams.duration;
                                graphQueryParams[`${filteredID}startTime`] = +d[dateParams.column] - dateParams.duration;
                            }

                            // Compute the query params from the data object.
                            let queryParams = Object.keys(params)
                                .reduce((queryParams, destinationParam) => {
                                    const sourceColumn = params[destinationParam];
                                    queryParams[destinationParam] = d[sourceColumn];
                                    return queryParams;
                                }, {});

                            let mergedQueryParams = Object.assign({}, queryParams, graphQueryParams);
                            // Override the existing context with the new params.
                            queryParams = Object.assign({}, this.props.orgContext, mergedQueryParams);

                            if(resetFilters) {
                                for (let key in mergedQueryParams) {
                                  if (mergedQueryParams.hasOwnProperty(key)) {
                                    queryParams[key] = '';
                                  }
                                }
                            }

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
            response,
            id
        } = this.props;

        const graphName      = configuration.graph,
              GraphComponent = GraphManager.getGraphComponent(graphName)

        if (!response.data) {
            console.log('Main source "data" key is not defined')
            return this.renderCardWithInfo("No data to visualize", "bar-chart");
        }

        for(let source in response) {
            if(response.hasOwnProperty(source)) {
                if (!response[source].length) {
                    console.log(`Source "${source}": No data to visualize`)
                    return this.renderCardWithInfo("No data to visualize", "bar-chart");
                }
            }
        }


        let graphHeight = d3.select(`#filter_${id}`).node() ? this.state.height - d3.select(`#filter_${id}`).node().getBoundingClientRect().height : this.state.height;
        return (
            <GraphComponent
              {...response}
              context={this.props.orgContext}
              configuration={configuration}
              width={this.state.width}
              height={graphHeight}
              goTo={this.props.goTo}
              {...this.state.listeners}
            />
        )
    }

    renderVisualizationIfNeeded() {

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

        return this.renderVisualization();
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
            configuration,
            response,
            error,
            isFetching
        } = this.props;

        if (isFetching || error) {
            return false;
        }

        if (!response.data || !response.data.length) {
            return null;
        }

        return (
            <CSVLink data={response.data} filename={ `${configuration.title ? configuration.title : 'data'}.csv` } >
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
            context,
            id
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
                <div>
                    { this.renderSharingOptions() }
                    <div id={`filter_${id}`}>
                        { this.renderNextPrevFilter() }
                        { this.renderFiltersToolBar() }
                        <div className="clearfix"></div>
                    </div>
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
    //Fetching Configurations of Visualizations

    const configurationID = ownProps.id || ownProps.params.id,
          orgContext = state.interface.get(InterfaceActionKeyStore.CONTEXT),
          configuration = state.configurations.getIn([
              ConfigurationsActionKeyStore.VISUALIZATIONS,
              configurationID,
              ConfigurationsActionKeyStore.DATA
          ]);

    let context = {};
    let filteredID = configurationID.replace(/-/g, '');

    for (let key in orgContext) {
      if(orgContext.hasOwnProperty(key)) {

        let filteredKey = key.replace(`${filteredID}`, '');
        if(!context[filteredKey] || key.includes(`${filteredID}`))
            context[filteredKey] = orgContext[key];
      }
    }

    const props = {
        id: configurationID,
        context: context,
        orgContext: orgContext,
        configuration: configuration ? contextualize(configuration.toJS(), context) : null,
        headerColor: state.interface.getIn([InterfaceActionKeyStore.HEADERCOLOR, configurationID]),
        tooltip: state.tooltip,
        isFetching: true,
        error: state.configurations.getIn([
            ConfigurationsActionKeyStore.VISUALIZATIONS,
            configurationID,
            ConfigurationsActionKeyStore.ERROR
        ])
    };

    let vizConfig =  configuration ? contextualize(configuration.toJS(), context) : null;
    props.configuration = updateFilterOptions(state, vizConfig, context);

    props.queryConfigurations = {}
    props.response = {}

    let successResultCount = 0
    //If configuratrions of visualizations fetched proceed to query configurations
    if (props.configuration && props.configuration.query) {

        const queries =  typeof props.configuration.query === 'string' ? {'data' : props.configuration.query} : props.configuration.query

        //Checking whether all the queries configurations has been fetched
        for(let query in queries) {
            if (queries.hasOwnProperty(query)) {
                let queryConfiguration = state.configurations.getIn([
                    ConfigurationsActionKeyStore.QUERIES,
                    queries[query]
                ]);

                if (queryConfiguration && !queryConfiguration.get(
                    ConfigurationsActionKeyStore.IS_FETCHING
                )) {
                    queryConfiguration = queryConfiguration.get(
                        ConfigurationsActionKeyStore.DATA
                    );
                    props.queryConfigurations[query] = queryConfiguration ? queryConfiguration.toJS() : null;

                }

                const scriptName = configuration.get("script");

                // Expose received response if it is available
                if (props.queryConfigurations[query] || scriptName) {

                    const requestID = ServiceManager.getRequestID(props.queryConfigurations[query] || scriptName, context);
                    let response = state.services.getIn([
                        ServiceActionKeyStore.REQUESTS,
                        requestID
                    ]);

                    if (response && !response.get(ServiceActionKeyStore.IS_FETCHING)) {
                        let responseJS = response.toJS();
                        if(responseJS.error) {
                            props.error = responseJS.error;
                        } else if(responseJS.results) {
                            successResultCount++;
                            props.response[query] =responseJS.results
                        }
                    }
                }
            }
        }

        if(successResultCount === Object.keys(queries).length ) {
            props.isFetching = false
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
