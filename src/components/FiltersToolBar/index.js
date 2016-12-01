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

    componentDidMount() {
        const {
            filterOptions,
            context,
            updateContext
        } = this.props;

        for(let name in filterOptions) {
            if (filterOptions.hasOwnProperty(name)) {
                let configOptions = filterOptions[name],
                    currentValue  = context[configOptions.parameter];

                if (!currentValue) {
                    // Update context with default value if not found
                    updateContext({
                        [configOptions.parameter]: configOptions.default
                    });
                }
            }
        };
    }

    render() {
        const {
            filterOptions,
            context
        } = this.props

        if (!filterOptions || Object.keys(filterOptions).lengh === 0)
            return (
                <div></div>
            );

        return (
            <div className="text-right">
                <ul className="list-inline" style={style.list}>
                {
                    Object.keys(filterOptions).map((name, i) => {

                        let configOptions = filterOptions[name],
                            currentValue  = context[configOptions.parameter] || configOptions.default;

                        return (
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

                                        let queryParams = Object.assign({}, context, {
                                            [configOptions.parameter]: option.value
                                        });

                                        let forceOptions = option.forceOptions;

                                        if (forceOptions)
                                            queryParams = Object.assign({}, queryParams, forceOptions);

                                        return (
                                            <MenuItem
                                                key={index}
                                                value={option.value}
                                                primaryText={option.label}
                                                style={style.menuItem}
                                                disabled={option.disabled}
                                                onTouchTap={() => { this.props.goTo(window.location.pathname, queryParams);}}
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
    context: state.interface.get(InterfaceActionKeyStore.CONTEXT)
})

const actionCreators = (dispatch) => ({

    goTo: function(link, context) {
        dispatch(InterfaceActions.updateContext(context));
        dispatch(push({pathname:link}));
    },

    updateContext: function(context) {
        dispatch(InterfaceActions.updateContext(context));
    }

});

export default connect(mapStateToProps, actionCreators)(FiltersToolBarView);
