import React from "react";
import PropTypes from "prop-types";
import isEqual from "lodash/isEqual";
import queryString from "query-string";

import { push } from "react-router-redux";
import { connect } from "react-redux";

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import objectPath from 'object-path';
import { events } from '../../lib/vis-graphs/utils/types'
import {
    Actions as InterfaceActions,
    ActionKeyStore as InterfaceActionKeyStore,
} from "../App/redux/actions";

import {
    Actions as ServiceActions
} from "../../services/servicemanager/redux/actions"
import { CUSTOM_FILTER, START_TIME } from '../../config';
import { Chips } from '../../ui-components';
import CustomFilter from './CustomFilter';

import style from "./styles";


export class FiltersToolBarView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            filterOptions: [],
            showFilterPopup: false,
            customFilterContent: {},
        }
        this.isCustomFilter = false;
        this.onTouchTap = this.onTouchTap.bind(this)
    }

    componentWillMount() {
        this.setFilterOptions(this.props)
    }

    componentWillReceiveProps(nextProps) {
        this.setFilterOptions(nextProps)
    }

    setFilterOptions(props) {
        let { context, filterOptions, customFilterContent } = props;

        let updatedFilterOptions = {};
        let childs = [];
        let selectedChilds = [];
        let sourceQueries = {};

        Object.keys(filterOptions).forEach((name, i) => {
            let filter = {...filterOptions[name], options: [], display: true, child: false, forceOptions: []};

            filterOptions[name].options.forEach((option) => {

                const { onChange, forceOptions, query_source } = option
                if (onChange) {
                    // add all available onChange options in the root of the object as an array
                    childs.push(onChange);
                    // check whether any child filter is selected or not
                    if (context[filterOptions[name].parameter] === option.value) {
                        selectedChilds.push(onChange);
                    }
                }

                // Updating Source Query
                if (context[filterOptions[name].parameter] === option.value && query_source) {
                    sourceQueries[name] = {
                        query: query_source
                    }

                    if(onChange) {
                        sourceQueries[name].onchange = onChange;
                    }
                }

                // add all available forceOptions properties in the root of the object as an array
                if(forceOptions) {
                    for (let key in forceOptions) {
                        if(forceOptions.hasOwnProperty(key) && !filter.forceOptions.includes(key))
                            filter.forceOptions.push(key)
                    }
                }

                filter.options.push({...option})
            })

            updatedFilterOptions[name] = filter;
        })

        // if any child filter is not pre-selected then make it hidden
        childs.forEach(child => {
            if(!selectedChilds.includes(child)) {
                updatedFilterOptions[child].display = false;
            }
        });

        // Cheching whether to display childs or not.
        let sourceQueryKeys = Object.keys(sourceQueries);
        const sourceQuery = sourceQueryKeys.length ? this.getSourceQuery(sourceQueries, sourceQueryKeys[0]) : null;
        this.setState({
            sourceQuery,
            filterOptions: updatedFilterOptions
        })
    }

    getSourceQuery(sourceQueries, key) {
        if (sourceQueries[key].onchange && sourceQueries[sourceQueries[key].onchange]) {
            return this.getSourceQuery(sourceQueries, sourceQueries[key].onchange);
        }

        return sourceQueries[key].query;
    }

    componentDidUpdate(prevProps) {
        if (!isEqual(prevProps.context,this.props.context) || !isEqual(prevProps.filterContext, this.props.filterContext)) {
            this.updateContext();
        }
    }

    componentDidMount() {
        this.updateContext();
    }

    updateContext() {
        const {
            context,
            filterContext,
            visualizationId,
            saveFilterContext,
            customFilterContent,
            dashboardId,
        } = this.props;
        const { filterOptions, sourceQuery } = this.state
        let configContexts = {};
        let filteredID = this.getFilteredVisualizationId();
        for(let name in filterOptions) {
            if (filterOptions.hasOwnProperty(name)) {
                let configOptions = filterOptions[name],
                    paramName     = visualizationId && configOptions.append ? `${filteredID}${configOptions.parameter}` : configOptions.parameter,
                    currentValue  = filterContext && filterContext[dashboardId] ?  filterContext[dashboardId][paramName] : context[paramName],
                    defaultOption = []

                if (configOptions.options && configOptions.display) {
                    let value = currentValue ? currentValue : configOptions.default;
                    // check value present in config. If not, then set value from default option
                    for(let i = 0; i < configOptions.options.length; i++) {
                        let option = configOptions.options[i];

                        if(option.value === value) {
                            defaultOption = []
                            defaultOption.push(option)
                            break;
                        }

                        if(option.default) {
                            defaultOption.push(option)
                        }
                    }

                    if(defaultOption.length) {
                            if (filterContext[dashboardId] && filterContext[dashboardId][paramName]) {
                                defaultOption = [];
                                defaultOption.push({
                                    startTime: objectPath.get(filterContext[dashboardId], 'startTime'),
                                    endTime: objectPath.get(filterContext[dashboardId], 'endTime'),
                                    interval: objectPath.get(filterContext[dashboardId], 'interval'),
                                });
                            } else {
                                configContexts[paramName] = configOptions.default;
                            }

                        if(defaultOption[0].forceOptions) {
                            configContexts = Object.assign({}, configContexts, this.updateForceOptionContext(defaultOption[0].forceOptions, configOptions.append));
                        }
                    }
                } else if (context[filterOptions[name].parameter]) {
                    // reset all params from context if they are not selected
                    configContexts[filterOptions[name].parameter] = '';
                    filterOptions[name].forceOptions.forEach( d => {
                        configContexts[d] = ''
                    })
                }
            }
        };
        // remove similar properties from new context (configContexts)
        for (let name in configContexts) {
            if(configContexts[name] === context[name])
                delete configContexts[name];
        };
        const sourceQueryId = `${filteredID}query_source`;
        if ((context[sourceQueryId] && context[sourceQueryId] !== sourceQuery) || (!context[sourceQueryId] && sourceQuery)) {
            configContexts[sourceQueryId] = sourceQuery
        }

        if(Object.keys(configContexts).length !== 0) {
            if(filterContext && dashboardId  && filterContext[dashboardId] && !Object.keys(filterContext[dashboardId]).length) {
                if (!configContexts['endTime']) {
                    configContexts['endTime'] = 'now';
                }
                saveFilterContext({[dashboardId]:configContexts}, visualizationId)
            }
            this.props.goTo(window.location.pathname, Object.assign({}, context, configContexts))
        }
    }

    getFilteredVisualizationId() {
        const {
            visualizationId
        } = this.props;

        return visualizationId ? visualizationId.replace(/-/g, '') : '';
      }

      updateForceOptionContext(forceOptions, append) {
        const {
            context
        } = this.props;

        let forceContext = {};
        let filteredID = append ? this.getFilteredVisualizationId() : '';

        for(let key in forceOptions) {
          if(forceOptions.hasOwnProperty(key) && (!context[key] || context[key] !== forceOptions[key])) {
              forceContext[`${filteredID}${key}`] = forceOptions[key];
          }
        }

        return forceContext;
    }

    renderCustomFilters = () => {
        return this.state.showFilterPopup && <CustomFilter resetCustomFilter={this.resetCustomFilter} />;
    }

    resetCustomFilter = (content) => {
        const {
          saveFilterContext,
          dashboard,
          goTo,
          setCustomFilterContext,
          dashboardId,
          customFilterContent,
          context,
          filterContext,
          filterOptions,
        } = this.props;
        this.isCustomFilter = content && content.startTime ? true : false;
        this.filterContent = content || {};
        this.setState({
          showFilterPopup: false,
        });
        const contextData = content || {};
        let dataToSet = customFilterContent;
        if(dataToSet[dashboardId]) {
          dataToSet[dashboardId] = contextData;
        }
        else {
          dataToSet = {...customFilterContent, [dashboardId]:contextData}
        }
        setCustomFilterContext(dataToSet);

        let queryString = {};

        if (this.isCustomFilter) {
          queryString = {
              startTime: objectPath.get(content, 'startTime'),
              endTime: objectPath.get(content, 'endTime'),
              interval: objectPath.get(content, 'interval'),
          }; 
          saveFilterContext({[dashboardId]:{
              startTime: objectPath.get(content, 'startTime'),
              endTime: objectPath.get(content, 'endTime'),
              interval: objectPath.get(content, 'interval'),
          }}, dashboard);
        }
        else {
            for(let name in filterOptions) {
                if (filterOptions.hasOwnProperty(name)) {
                    let configOptions = filterOptions[name];
                    queryString = {...queryString, [configOptions.parameter]:configOptions.default}
                }
            }
            saveFilterContext({[dashboardId]:queryString}, dashboard);
        }

        goTo(window.location.pathname, queryString);
    }

    onTouchTap(queryParams) {
        const {
            saveFilterContext,
            visualizationId,
            context,
            goTo,
            dashboardId,
            customFilterContent,
            setCustomFilterContext,
        } = this.props;
        if (queryParams.startTime === CUSTOM_FILTER) {
            this.isCustomFilter = true;
            this.setState({
                showFilterPopup: true
            });
        } else {
            let tContext = context;
            if (customFilterContent && customFilterContent[dashboardId] && Object.keys(customFilterContent[dashboardId]).length > 0 && queryParams.startTime) {
                if (tContext['endTime']) { tContext['endTime'] = 'now'}
                if (tContext['formatStartTime']) { delete tContext['formatStartTime'] }
                if (tContext['formatEndTime']) { delete tContext['formatEndTime'] }
                const contextData = {};
                let dataToSet = customFilterContent;
                if(dataToSet[dashboardId]) {
                  dataToSet[dashboardId] = contextData;
                }
                else {
                  dataToSet = {...customFilterContent, [dashboardId]:contextData}
                }
                setCustomFilterContext(dataToSet);
            }
            
            saveFilterContext({[dashboardId]:Object.assign({}, tContext, queryParams)}, visualizationId);
            goTo(window.location.pathname, Object.assign({}, tContext, queryParams));
        }
    }

    renderDropdownContent() {
        const {
            context,
            visualizationId,
            customFilterContent,
            filterContext,
            dashboardId,
        } = this.props

        const { filterOptions } = this.state

        let filteredID = this.getFilteredVisualizationId(),
            content = []

        if (!filterOptions || Object.keys(filterOptions).length === 0)
            return (<div></div>);


        Object.keys(filterOptions).forEach((name, i) => {

            let configOptions = filterOptions[name],
                paramName = visualizationId && configOptions.append ? `${filteredID}${configOptions.parameter}` : configOptions.parameter,
                currentValue = (filterContext && filterContext[dashboardId] ?  filterContext[dashboardId][paramName] : context[paramName])  || configOptions.default;
            if (customFilterContent[dashboardId] && Object.keys(customFilterContent[dashboardId]).length > 0 && paramName === "startTime") {
                currentValue = 'custom';
            }
            else if(customFilterContent[dashboardId] && Object.keys(customFilterContent[dashboardId]).length > 0  && paramName === "startTime") {
              currentValue = configOptions.default
            }
            // Hide all dependent child filters or show them if they are present in context
            if (configOptions.display) {
                content.push(
                    <li
                        key={i}
                        style={style.listItem}>
                        <label style={style.label} htmlFor={name}>
                            {name}
                        </label>
                        <DropDownMenu
                            name={name}
                            value={currentValue}
                            style={style.dropdownMenu}
                            disabled={configOptions.disabled}
                        >

                            {configOptions.options.map((option, index) => {
                                let queryParams = { [paramName]: option.value },
                                    forceOptions = option.forceOptions

                                if (forceOptions)
                                    queryParams = Object.assign({}, queryParams, this.updateForceOptionContext(forceOptions, configOptions.append));

                                queryParams = Object.assign({}, queryParams);

                                return (
                                    <MenuItem
                                        key={index}
                                        value={option.value}
                                        primaryText={option.label}
                                        style={style.menuItem}
                                        disabled={option.disabled}
                                        onClick={() => this.onTouchTap(queryParams)}
                                    />
                                )
                            })}
                        </DropDownMenu>

                    </li>
                )
            }
        })

        return content;
    }

    renderCustomFilterTag = () => {
        const { visualizationId, context, customFilterContent, dashboardId } = this.props;
        if(dashboardId && customFilterContent[dashboardId]) {
            const { formatStartTime, formatEndTime, interval, startTime } = customFilterContent[dashboardId];
            let content = `${formatStartTime} - ${formatEndTime}`;
            content += interval ? ` (${interval})` : '';
        
          return ((!visualizationId && startTime && (Object.keys(customFilterContent[dashboardId]).length > 0) ) &&
              <li style={style.listItem}>
                  <Chips
                      content={content}
                      onClose={this.resetCustomFilter}
                  />
              </li>
          )
        }
        return <React.Fragment/>
    }

    render() {
        return (
            <div className="text-right">
                <ul className="list-inline" style={style.list}>
                    {this.renderCustomFilterTag()}
                    {this.renderDropdownContent()}
                    {this.renderCustomFilters()}
                </ul>
            </div>
        )
    }
}

FiltersToolBarView.propTypes = {
    filterOptions: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
    context: state.interface.get(InterfaceActionKeyStore.CONTEXT),
    filterContext: state.interface.get(InterfaceActionKeyStore.FILTER_CONTEXT),
    customFilterContent: state.interface.get(InterfaceActionKeyStore.CUSTOM_FILTER),
})

const actionCreators = (dispatch) => ({

    goTo: function (link, context) {
        dispatch(push({ pathname: link, search: queryString.stringify(context) }));
    },
    saveFilterContext: function (context, visualizationId = null) {
        dispatch(ServiceActions.updateScroll(visualizationId, { page: 1, event: events.FILTER }))
        dispatch(InterfaceActions.filterContext(context));
    },
    setCustomFilterContext: function (customFilter) {
        dispatch(InterfaceActions.setCustomFilterContext(customFilter));
    }

});

export default connect(mapStateToProps, actionCreators)(FiltersToolBarView);
