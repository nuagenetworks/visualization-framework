import React from "react";
import ReactDOM from "react-dom";
import ReactInterval from 'react-interval';
import objectPath from "object-path";

import $ from "jquery";
import CopyToClipboard from 'react-copy-to-clipboard';

import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { push } from "react-router-redux";

import FiltersToolBar from "../FiltersToolBar";
import NextPrevFilter from "../NextPrevFilter";
import { CardOverlay } from "../CardOverlay";
import { Card, CardText } from 'material-ui/Card';
import Script from "../../components/Script"
import queryString from "query-string";
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

import {
    Actions as VFSActions,
} from '../../features/redux/actions'

import { resizeVisualization } from "../../utils/resize"
import { contextualize } from "../../utils/configurations"
import columnAccessor from "../../lib/vis-graphs/utils/columnAccessor"

import { GraphManager } from "../../lib/vis-graphs/index"
import { ServiceManager } from "../../services/servicemanager/index";

import { ActionKeyStore  as VSDKeyStore } from "../../configs/nuage/vsd/redux/actions";

import style from "./styles";

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

        this.handleSelect = this.handleSelect.bind(this)
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

        this.initialize(nextProps.id)
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
                context,
                dashboard
            } = this.props;

            if (!configuration)
                return;

            const queries  = configuration.query,
                  scriptName = configuration.script;

            if (scriptName) {
                const { executeScriptIfNeeded } = this.props;
                executeScriptIfNeeded(scriptName, context, false, dashboard);
            }

            if (queries) {
                for(let key in queries) {
                    if (queries.hasOwnProperty(key)) {

                        this.props.fetchQueryIfNeeded(queries[key].name).then(() => {

                            const { queryConfigurations, executeQueryIfNeeded } = this.props;

                            let queryConfiguration = queryConfigurations[key]

                            if(!queryConfiguration) {
                                return
                            }

                            executeQueryIfNeeded(
                                {...queryConfiguration, tabifyOptions: configuration.data.tabifyOptions || {} },
                                context,
                                queries[key].scroll || false,
                                dashboard)
                                .then(
                                    () => {
                                    },
                                    (error) => {
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
                const GraphComponent = GraphManager.getGraphComponent(configuration.graph)

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

                            let graphQueryParams = {},
                                resetFilters = false,
                                vizID = `${id.replace(/-/g, '')}vkey`,
                                vKey = GraphComponent.getGraphKey(configuration);

                            if(vKey) {
                                const graphKey = vKey(d);
                                if(this.props.orgContext[vizID] === graphKey) {
                                    resetFilters = true;
                                }
                                graphQueryParams[vizID] = graphKey;
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

    // return the column array from configuration
    getColumns(configuration) {
        return configuration.data.columns.map( d => d.column)
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

    handleSelect({rows, matchingRows}) {
        const {
            selectRow,
            location,
            id
        } = this.props

        selectRow(id, rows, matchingRows, location.query, location.pathname)
    }

    updateScrollData(data) {
        const {
            id,
            updateScroll
        } = this.props;

        updateScroll(id, data)
    }

    renderVisualization() {
        const {
            configuration,
            response,
            id,
            googleMapURL,
            scroll,
            scrollData,
            googleMapsAPIKey
        } = this.props;

        const GraphComponent = GraphManager.getGraphComponent(configuration.graph);

        if (!response.data) {
            console.log('Main source "data" key is not defined')
            return this.renderCardWithInfo("No data to visualize", "bar-chart");
        }

        let graphHeight = d3.select(`#filter_${id}`).node() ? this.state.height - d3.select(`#filter_${id}`).node().getBoundingClientRect().height : this.state.height;

        return (
            <GraphComponent
              {...response}
              onSelect={this.handleSelect}
              context={this.props.orgContext}
              configuration={configuration}
              width={this.state.width}
              height={graphHeight}
              goTo={this.props.goTo}
              {...this.state.listeners}
              googleMapURL={googleMapURL}
              scroll={scroll}
              scrollData={scrollData} //Specific for table component
              updateScroll={this.updateScrollData.bind(this)}
              googleMapsAPIKey={googleMapsAPIKey}
              Script={Script}
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
                onClick={() => { this.setState({showDescription: !this.state.showDescription}); }}
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
                onClick={() => { this.setState({showSharingOptions: !this.state.showSharingOptions}); }}
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
            headerColor,
            configuration
        } = this.props;

        let color = Object.assign({}, style.cardTitle, headerColor ? headerColor : {});

        return (
            <div>
                <div style={color}>
                    <div title={configuration.title} style={{ flex: 'auto', overflow: 'hidden', paddingTop: '2px' }}>
                        {configuration.title}
                    </div>
                    <div style={{ flex: 'none', paddingTop: '2px' }}>
                        {this.renderDescriptionIcon()}
                        {this.renderShareIcon()}
                        {this.renderDownloadIcon()}
                    </div>
                </div>
            </div>
        )
    }

    renderFiltersToolBar() {
        const {
            filterOptions,
            id
        } = this.props

        if (!filterOptions)
            return

        return (
            <FiltersToolBar filterOptions={filterOptions} visualizationId={id} />
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
        const iframeText = "<iframe src=\"" + window.location.origin + "/reports/visualizations/" + configuration.id + "?" + $.param(queryParams) + "\" width=\"800\" height=\"600\"></iframe>";

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
                    to={{ pathname:"/reports/visualizations/" + configuration.id, search: queryString.stringify(queryParams) }}
                    target="_blank"
                    >
                    <button className="btn btn-default btn-xs" onClick={() => {
                    }}>
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
            id,
            hideGraph
        } = this.props;

        if (hideGraph || !configuration)
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

        let refreshInterval = parseInt(context.refreshInterval, 10),
            timeout         = parseInt(configuration.refreshInterval, 10) || refreshInterval,
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

const updateFilterOptions = (state, configurations, context, results = []) => {

    if (configurations && configurations.filterOptions) {
        let filterOptions = { ...configurations.filterOptions }

        for (let key in filterOptions) {

            if (!filterOptions[key].options) {
                filterOptions[key].options = []
            }

            // append filters fetching from query
            if (filterOptions[key].dynamicOptions) {
                const {
                    queryKey = null,
                    label = null,
                    value = null,
                    forceOptions = null
                } = filterOptions[key].dynamicOptions;

                const querySource = filterOptions[key].query_source || null;


                if (queryKey && value) {
                    // format value and label
                    const formattedValue = columnAccessor({ column: value })
                    const formattedLabel = label ? columnAccessor({ column: label }) : formattedValue
                    let forceOptionsConfig = {}

                    if (forceOptions) {
                        for (let key in forceOptions) {
                            if (forceOptions.hasOwnProperty(key)) {
                                forceOptionsConfig[key] = columnAccessor({ column: forceOptions[key] })
                            }
                        }
                    }

                    if (results[queryKey]) {

                        results[queryKey].forEach(d => {
                            let dataValue = formattedValue(d, true)
                            let dataLabel = label ? formattedLabel(d, true) : dataValue

                            if (dataValue && !filterOptions[key].options.find(datum =>
                                datum.value === dataValue.toString() || datum.label === dataLabel)) {

                                let forceOptionsData = {}
                                // if forceOptions present then calculate forceOptions values and append it in options
                                if (forceOptionsConfig) {
                                    for (let key in forceOptionsConfig) {
                                        if (forceOptionsConfig.hasOwnProperty(key)) {
                                            forceOptionsData[key] = forceOptionsConfig[key](d, true) || ''
                                        }
                                    }
                                }

                                const dynamicOption = {
                                    label: dataLabel,
                                    value: dataValue.toString(),
                                    forceOptions: forceOptionsData,

                                }

                                if(querySource) {
                                    dynamicOption.query_source = querySource;
                                }
                                // Add filters in existing filter options
                                filterOptions[key].options.push(dynamicOption);


                            }
                        })
                    }
                }
            }

            // TODO -
            if(filterOptions[key].type) {
                if(context && context.enterpriseID) {
                    let nsgs = state.services.getIn([ServiceActionKeyStore.REQUESTS, `enterprises/${context.enterpriseID}/${filterOptions[key].name}`, ServiceActionKeyStore.RESULTS]);

                    if(nsgs && nsgs.length) {
                        filterOptions[key].options = [];
                        filterOptions[key].default = nsgs[0].name;

                        nsgs.forEach((nsg) => {
                        filterOptions[key].options.push({
                            label: nsg.name,
                            value: nsg.name
                        });
                        });
                    }
                }
            }
        }

        return filterOptions
    }
}

const replaceQuery = (replace, query, context) => {
    let key = 'replace';
    let config = findPropertyPath(query, key);

    while (config) {
        let replaceIndex = config.lastIndexOf('.', config.length - (key.length + 1));
        let replaceStr = config.substr(0, replaceIndex);

        let insertPosition = config.lastIndexOf('.', config.length - (key.length + 2));
        let insertString = config.substr(0, insertPosition);
        let repKey = objectPath.get(query, config);

        objectPath.del(query, replaceStr);

        let replaceData = replace[repKey]
        if (replaceData && context[replaceData.context]) {

            for (let key in replaceData.query) {
                if(replaceData.query.hasOwnProperty(key)) {
                    objectPath.push(query, insertString, {
                        [key]: replaceData.query[key]
                    });
                }
            }
        }

        config = findPropertyPath(query, "replace")
    }
}

function findPropertyPath(obj, name) {
    for (var prop in obj) {
        if (prop === name) {
            return name;
        } else if (typeof obj[prop] === "object") {
            var result = findPropertyPath(obj[prop], name);
            if (result) { return prop + '.' + result; }
        }
    }

    return null;
}

const mapStateToProps = (state, ownProps) => {
    //Fetching Configurations of Visualizations

    const configurationID = ownProps.id || ownProps.match.params.id,
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
    const userContext = state.VSD.get(VSDKeyStore.USER_CONTEXT);
    const googleMapsAPIKey = (userContext && userContext.googleMapsAPIKey) || process.env.REACT_APP_GOOGLE_MAP_API;

    const realConfiguation = configuration && configuration.toJS();

    const contextualizeConfiguration = configuration ? contextualize(configuration.toJS(), context) : null

    const props = {
        id: configurationID,
        context: context,
        orgContext: orgContext,
        location: state.router.location,
        configuration: contextualizeConfiguration,
        headerColor: state.interface.getIn([InterfaceActionKeyStore.HEADERCOLOR, configurationID]),
        isFetching: true,
        hideGraph: false,
        scroll: false,
        error: state.configurations.getIn([
            ConfigurationsActionKeyStore.VISUALIZATIONS,
            configurationID,
            ConfigurationsActionKeyStore.ERROR
        ]),
        googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${googleMapsAPIKey}&v=3.exp&libraries=${process.env.REACT_APP_GOOGLE_MAP_LIBRARIES}`,
        scrollData: state.services.getIn([ServiceActionKeyStore.SCROLL_DATA, configurationID]),
        googleMapsAPIKey,
    };

    props.queryConfigurations = {}
    props.response = {}

    let successResultCount = 0
    //If configuratrions of visualizations fetched proceed to query configurations
    if (props.configuration && props.configuration.query) {

         /**
         * Format the query as given below:
         * "query": {
                "data": "query-name-1",
                "keyName": "query-name-2"
            }
        */
        const queries =  typeof props.configuration.query === 'string' ? {'data' : {'name': props.configuration.query}} : props.configuration.query

        props.configuration.query = {}

        //Checking whether all the queries configurations has been fetched
        for(let query in queries) {
            if (queries.hasOwnProperty(query)) {

                /**
                 * Format the query as given below:
                 * "query": {
                        "data": {"name": "query-name-1", "required": true},
                        "keyName": {"name": "query-name-2", "required": false}
                    }
                */
                let queryConfig = Object.assign({}, typeof queries[query] === 'string' ? { 'name': queries[query]} : queries[query])

                if(query === 'data') {
                    queryConfig.required = true

                    // override main query from filter query
                    if(context.query_source) {
                        queryConfig.name = context.query_source;
                    }

                    // check scroll is enabled or not on primary data
                    if(queryConfig.scroll)
                        props.scroll = true;
                }

                props.configuration.query[query] = queryConfig

                let queryConfiguration = state.configurations.getIn([
                    ConfigurationsActionKeyStore.QUERIES,
                    queryConfig.name
                ]);

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
                    props.queryConfigurations[query] = queryConfiguration ? queryConfiguration.toJS() : null;
                    if(props.queryConfigurations[query]) {
                        props.queryConfigurations[query].vizID = configurationID;
                    }

                }

                if(realConfiguation  && props.queryConfigurations[query]) {
                    replaceQuery(realConfiguation.replace, props.queryConfigurations[query], props.context);
                }

                const scriptName = configuration.get("script");

                // Expose received response if it is available
                if (props.queryConfigurations[query] || scriptName) {

                    // Updating the QUERY with Sorting and searching if scroll is enable
                    if(queryConfig.scroll) {
                        props.queryConfigurations[query] = ServiceManager.addSearching(props.queryConfigurations[query], objectPath.get(props.scrollData, 'search'));
                        props.queryConfigurations[query] = ServiceManager.addSorting(props.queryConfigurations[query], objectPath.get(props.scrollData, 'sort'));
                    }

                    const requestID = ServiceManager.getRequestID(props.queryConfigurations[query] || scriptName, context);

                    if (typeof requestID === 'undefined') {
                        props.hideGraph = true
                    } else {
                        let response = state.services.getIn([
                            ServiceActionKeyStore.REQUESTS,
                            requestID
                        ]);

                        if (!response && queryConfig.required !== false) {
                            props.error = 'Not able to load data'
                        }

                        if (response && !response.get(ServiceActionKeyStore.IS_FETCHING)) {
                            let responseJS = response.toJS();

                            if (responseJS.error && queryConfig.required !== false) {
                                props.error = responseJS.error;
                            } else if (responseJS.results) {
                                successResultCount++;
                                props.response[query] = responseJS.results
                            }
                        }
                    }
                }
            }
        }

        props.filterOptions = updateFilterOptions(state, contextualizeConfiguration, context, props.response);

        if(successResultCount === Object.keys(queries).length ) {
            props.isFetching = false;
        }
    }

    return props
};

const actionCreators = (dispatch) => ({

    setPageTitle: function(aTitle) {
        dispatch(InterfaceActions.updateTitle(aTitle));
    },

    goTo: function(link, context) {
        dispatch(push({pathname:link, search:queryString.stringify(context)}));
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

    executeQueryIfNeeded: function(queryConfiguration, context, scroll, dashboard = null) {
        return dispatch(ServiceActions.fetchIfNeeded(queryConfiguration, context, false, scroll, dashboard));
    },

    executeScriptIfNeeded: function(scriptName, context, scroll, dashboard = null) {
        return dispatch(ServiceActions.fetchIfNeeded(scriptName, context, false, scroll, dashboard));
    },

    selectRow: function(vssID, row, matchingRows, currentQueryParams, currentPath) {
        return dispatch(VFSActions.selectRow(vssID, row, matchingRows, currentQueryParams, currentPath))
    },

    updateScroll: function(id, params) {
        return dispatch(ServiceActions.updateScroll(id, params));
    }

 });


export default connect(mapStateToProps, actionCreators)(VisualizationView);
