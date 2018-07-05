import React from "react";

import { push } from "redux-router";
import { connect } from "react-redux";

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import {
    Actions as InterfaceActions,
    ActionKeyStore as InterfaceActionKeyStore
} from "../App/redux/actions";

import style from "./styles";


export class FiltersToolBarView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            filterOptions: []
        }

        this.onTouchTap = this.onTouchTap.bind(this)
    }

    componentWillMount() {
        this.setFilterOptions(this.props)
    }

    componentWillReceiveProps(nextProps) {
        this.setFilterOptions(nextProps)
    }

    setFilterOptions(props) {
        let filterOptions = {};
        let childs = [];

        Object.keys(props.filterOptions).forEach((name, i) => {
            let filter = {...props.filterOptions[name], options: [], childs: [], display: true, child: false, forceOptions: null};

            props.filterOptions[name].options.forEach((option) => {
                if (option.onChange) {
                    filter.childs.push(option.onChange);
                    childs.push(option.onChange);

                    //Changing the value to match the label to make it preselected.
                    filter.options.push({...option, value: option.onChange})
                } else {
                    filter.options.push({...option})
                }

                // update force options in top level for default value
                if (option.forceOptions && filter.default === option.value)
                    filter.forceOptions = option.forceOptions
            })

            filterOptions[name] = filter;
        })

        // Setting as Child and checking whether to display or not
        childs.forEach(child => {
            if(!filterOptions[child]) {
                return;
            }

            filterOptions[child].child = true;
            const contextName = `child_${filterOptions[child].parameter}`;
            if(!props.context[contextName] || props.context[contextName] !== child) {
                filterOptions[child].display = false;
            }
        });

        // Cheching whether to display childs or not.
        this.setState({
            filterOptions
        })
    }

    componentDidMount() {
        const {
            context,
            filterContext,
            visualizationId,
            saveFilterContext
        } = this.props;

        const { filterOptions } = this.state


        let configContexts = {};
        let filteredID = this.getFilteredVisualizationId();

        for(let name in filterOptions) {
            if (filterOptions.hasOwnProperty(name)) {
                let configOptions = filterOptions[name],
                    paramName     = visualizationId && configOptions.append ? `${filteredID}${configOptions.parameter}` : configOptions.parameter,
                    currentValue  = context[paramName],
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
                        if(currentValue !== defaultOption[0].value) {
                            configContexts[paramName] = defaultOption[0].value
                        }

                        if(defaultOption[0].forceOptions) {
                            configContexts = Object.assign({}, configContexts, this.updateForceOptionContext(defaultOption[0].forceOptions, configOptions.append));
                        }
                    }
                }
            }
        };

        if(Object.keys(configContexts).length !== 0) {

            if(!Object.keys(filterContext).length) {
                saveFilterContext(configContexts)
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

    onTouchTap(queryParams) {
        const {
            saveFilterContext,
            context,
            goTo
        } = this.props;

        saveFilterContext(queryParams);
        goTo(window.location.pathname, Object.assign({}, context, queryParams));
    }

    renderDropdownContent() {
        const {
            context,
            visualizationId
        } = this.props

        const { filterOptions } = this.state

        let filteredID = this.getFilteredVisualizationId(),
            content = []

        if (!filterOptions || Object.keys(filterOptions).lengh === 0)
            return (<div></div>);


        Object.keys(filterOptions).forEach((name, i) => {

            let configOptions = filterOptions[name],
                paramName = visualizationId && configOptions.append ? `${filteredID}${configOptions.parameter}` : configOptions.parameter,
                currentValue = !configOptions.child && context[`child_${paramName}`] || context[paramName] || configOptions.default;

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
                                let queryParams  = null,
                                    forceOptions = null,
                                    onChange     = option.onChange || null


                                // if option contain onChange then set default value and forceOptions for child filter
                                if(onChange && filterOptions[onChange]) {
                                    queryParams = { [paramName]: filterOptions[onChange].default };
                                    forceOptions = filterOptions[onChange].forceOptions;
                                } else {
                                    queryParams = { [paramName]: option.value };
                                    forceOptions = option.forceOptions;
                                }

                                if (forceOptions)
                                    queryParams = Object.assign({}, queryParams, this.updateForceOptionContext(forceOptions, configOptions.append));

                                let childParams = {}

                                if (!configOptions.child) {
                                    /**
                                     * check if option have onChange property then update onchange property in context
                                     * to show dependent filter (mention in onChange)
                                     */
                                    if (onChange && filterOptions[onChange]) {
                                        childParams[`child_${filterOptions[onChange].parameter}`] = onChange
                                    } else {
                                        configOptions.childs.forEach(name => {
                                            if (filterOptions[name])
                                                childParams[`child_${filterOptions[name].parameter}`] = ''
                                        })
                                    }
                                }

                                queryParams = Object.assign({}, queryParams, childParams);

                                return (
                                    <MenuItem
                                        key={index}
                                        value={option.value}
                                        primaryText={option.label}
                                        style={style.menuItem}
                                        disabled={option.disabled}
                                        onTouchTap={() => this.onTouchTap(queryParams)}
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

    render() {
        return (
            <div className="text-right">
                <ul className="list-inline" style={style.list}>
                    { this.renderDropdownContent() }
                </ul>
            </div>
        )
    }
}

FiltersToolBarView.propTypes = {
    filterOptions: React.PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
    context: state.interface.get(InterfaceActionKeyStore.CONTEXT),
    filterContext: state.interface.get(InterfaceActionKeyStore.FILTER_CONTEXT),
})

const actionCreators = (dispatch) => ({

    goTo: function(link, context) {
        dispatch(push({pathname:link, query:context}));
    },
    saveFilterContext: function(context) {
        dispatch(InterfaceActions.filterContext(context));
    }

});

export default connect(mapStateToProps, actionCreators)(FiltersToolBarView);
