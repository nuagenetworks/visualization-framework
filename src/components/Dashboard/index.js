import React from "react";

import { connect } from "react-redux";
import { push } from "redux-router";
import { Link } from "react-router";

import IconMenu from "material-ui/IconMenu";
import MenuItem from "material-ui/MenuItem";
import CircularProgress from "material-ui/CircularProgress";
import { Responsive, WidthProvider } from "react-grid-layout";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

import Visualization from "../Visualization";

import { Actions as AppActions } from "../App/redux/actions";

import {
    Actions as ConfigurationsActions,
    ActionKeyStore as ConfigurationsActionKeyStore
} from "../../services/configurations/redux/actions";

import style from "./styles";
import FontAwesome from "react-fontawesome";


export class DashboardView extends React.Component {

    constructor(props) {
        super(props);
        this.resizeCallbacks = [];
    }

    componentWillMount() {
        this.props.setPageTitle("Dashboard");
        this.updateConfiguration();
    }

    componentWillUnmount() {
        this.resizeCallbacks = null;
    }

    componentDidUpdate(prevProps) {
        this.updateTitleIfNecessary(prevProps);
        this.updateConfiguration();
    }

    shouldUpdateTitle(prevProps){
        if (!prevProps.configuration) {
            return true;

        } else {
            return (
                this.props.configuration.get("title")
                !==
                prevProps.configuration.get("title")
            );
        }
    }

    updateTitleIfNecessary(prevProps) {
        const { configuration, setPageTitle } = this.props;

        if (!configuration)
            return;

        if (this.shouldUpdateTitle(prevProps)) {
            setPageTitle(configuration.get("title"));
        }
    }

    updateConfiguration() {
        const { params, fetchConfigurationIfNeeded } = this.props;

        if (!params.id)
            return;

        fetchConfigurationIfNeeded(params.id);
    }

    onResize() {
        this.resizeCallbacks.forEach((callback) => callback());
    }

    registerResize(callback){
        this.resizeCallbacks.push(callback);
    }

    renderNavigationBar() {
        return (
            <div style={style.navigationContainer}>
                {this.renderNavigationLinks()}
                <div className="pull-right">
                    {this.renderFilterOptions()}
                </div>
            </div>
        );
    }

    renderNavigationLinks() {
        const { configuration, location } = this.props;

        const links = configuration.get("links");

        if (!links || links.length === 0)
            return;

        return (
            <ul className="list-inline" style={style.linksList}>
                {links.map((link, index) => {
                    return <li key={index}
                               style={style.link}
                               >
                                <Link to={link.get("url")} query={location.query}>
                                    {link.get("label")}
                                </Link>
                           </li>;
                })}
            </ul>
        );
    }

    renderFilterOptions() {
        const { configuration, location } = this.props;

        const filterOptions = configuration.get("filterOptions");

        if (!filterOptions || filterOptions.length === 0)
            return;

        let context = location.query;

        return (
            <IconMenu
                iconButtonElement={
                    <FontAwesome
                        name="ellipsis-v"
                        style={style.iconMenu}
                        />
                }
                anchorOrigin={{horizontal: "right", vertical: "top"}}
                targetOrigin={{horizontal: "right", vertical: "top"}}
                >
                {filterOptions.map((option, index) => {

                    let queryParams = Object.assign({}, context, {
                        [option.get("parameter")]: option.get("value")
                    });

                    return (
                        <MenuItem
                            key={index}
                            primaryText={option.get("label")}
                            style={style.menuItem}
                            onTouchTap={() => { this.props.goTo(window.location.pathname, queryParams);}}
                            />
                    );
                })}
            </IconMenu>
        );
    }

    renderNavigationBarIfNeeded() {
        const { configuration } = this.props;

        const links         = configuration.get("links"),
            filterOptions = configuration.get("filterOptions");

        if (!links && !filterOptions)
            return;

        return this.renderNavigationBar();
    }

    render() {
        const { configuration, error, fetching, location} = this.props;

        if (fetching) {
            return (
                <div>
                    <CircularProgress color="#eeeeee"/>
                    This dashboard component is loading the configuration file...
                </div>
            );

        } else if (error) {
            return (
                <div>{error}</div>
            );

        } else if (configuration) {
            const { visualizations } = configuration.toJS();

            return (
                <div>
                    {this.renderNavigationBarIfNeeded()}
                    <div style={style.gridContainer}>
                        <ResponsiveReactGridLayout
                            rowHeight={10}
                            margin={[12,12]}
                            containerPadding={[10, 10]}
                            onResize={this.onResize.bind(this)}
                            onLayoutChange={this.onResize.bind(this)}
                        >
                            {
                                visualizations.map((visualization) =>
                                    <div
                                        key={visualization.id}
                                        data-grid={visualization}
                                    >
                                        <Visualization
                                            id={visualization.id}
                                            context={location.query}
                                            registerResize={this.registerResize.bind(this)}
                                        />
                                    </div>
                                )
                            }
                        </ResponsiveReactGridLayout>
                    </div>
                </div>
            );
        } else {
            return <div>No dashboard</div>;
        }
    }
}


const mapStateToProps = (state, ownProps) => ({
    configuration: state.configurations.getIn([
        ConfigurationsActionKeyStore.DASHBOARDS,
        ownProps.params.id,
        ConfigurationsActionKeyStore.DATA
    ]),

    fetching: state.configurations.getIn([
        ConfigurationsActionKeyStore.DASHBOARDS,
        ownProps.params.id,
        ConfigurationsActionKeyStore.IS_FETCHING
    ]),

    error: state.configurations.getIn([
        ConfigurationsActionKeyStore.DASHBOARDS,
        ownProps.params.id,
        ConfigurationsActionKeyStore.ERROR
    ])
});

const actionCreators = (dispatch) => ({
    setPageTitle: (aTitle) => {
        dispatch(AppActions.updateTitle(aTitle));
    },

    fetchConfigurationIfNeeded: (id) => {
        return dispatch(ConfigurationsActions.fetchIfNeeded(
            id,
            ConfigurationsActionKeyStore.DASHBOARDS
        ));
    },

    goTo: function(link, filters) {
        dispatch(push({pathname:link, query:filters}));
    },
});


export default connect(mapStateToProps, actionCreators)(DashboardView);
