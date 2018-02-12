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

    componentDidMount() {
        const {
            context,
            filterOptions,
            filterContext,
            visualizationId,
            saveFilterContext
        } = this.props;

        let configContexts = {};
        let filteredID = this.getFilteredVisualizationId();

        for(let name in filterOptions) {
            if (filterOptions.hasOwnProperty(name)) {
                let configOptions = filterOptions[name],
                    paramName     = visualizationId && configOptions.append ? `${filteredID}${configOptions.parameter}` : configOptions.parameter,
                    currentValue  = context[paramName],
                    defaultOption = []


                if (configOptions.options) {
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



    render() {
        const {
            filterOptions,
            context,
            visualizationId
        } = this.props

        let filteredID = this.getFilteredVisualizationId();

        if (!filterOptions || Object.keys(filterOptions).lengh === 0)
            return (
                <div></div>
            );
        return (
            <div  className="text-right">
                <ul className="list-inline" style={style.list}>
                {

                    Object.keys(filterOptions).map((name, i) => {

                        let configOptions = filterOptions[name],
                            paramName = visualizationId && configOptions.append  ? `${filteredID}${configOptions.parameter}` : configOptions.parameter,
                            currentValue  = context[paramName] || configOptions.default;
                        return (
                            <li
                                key={i}
                                    
                                    style={style.listItem} >
                                <label style={style.label} htmlFor={name} >
                                    {name}
                                </label>
                                <DropDownMenu
                                    name={name}
                                    className="filter-options"
                                    value={currentValue}
                                    style={style.dropdownMenu}
                                    disabled={configOptions.disabled}
                                    >

                                    {configOptions.options.map((option, index) => {

                                        let queryParams = {[paramName]: option.value};

                                        let forceOptions = option.forceOptions;

                                        if (forceOptions)
                                            queryParams = Object.assign({}, queryParams, this.updateForceOptionContext(forceOptions, configOptions.append));

                                        return (
                                            <MenuItem
                                                key={index}
                                                value={option.value}
                                                primaryText={option.label}
                                                style={style.menuItem}
                                                disabled={option.disabled}
                                                onTouchTap={() => { this.props.saveFilterContext(queryParams); this.props.goTo(window.location.pathname, Object.assign({}, context, queryParams));}}
                                                />
                                        )
                                    })}
                                </DropDownMenu>

                            </li>
                        )
                    })}
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
