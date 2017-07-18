import React from "react";

import { connect } from "react-redux";
import { Link } from "react-router";

import CircularProgress from "material-ui/CircularProgress";
import { Responsive, WidthProvider } from "react-grid-layout";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

import Visualization from "../Visualization";
import FiltersToolBar from "../FiltersToolBar";

import { Actions as AppActions } from "../App/redux/actions";

import {
    Actions as ConfigurationsActions,
    ActionKeyStore as ConfigurationsActionKeyStore
} from "../../services/configurations/redux/actions";

import {
    ActionKeyStore as InterfaceActionKeyStore
} from "../App/redux/actions";

import { contextualize } from "../../utils/configurations"

import { defaultFilterOptions } from "./default.js"

import style from "./styles";


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

    currentTitle() {
        const {
            configuration,
            context
        } = this.props;
        const title = configuration.get("title");

        if (!title)
            return ;

        return contextualize(title, context);
    }

    updateTitleIfNecessary(prevProps) {
        const { configuration, setPageTitle } = this.props;

        if (!configuration)
            return;

        setPageTitle(this.currentTitle());
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

    renderNavigationBarIfNeeded() {
        const {
            configuration,
            context
        } = this.props;

        const links = configuration.get("links");

        if (!links || links.count() === 0)
            return;

        return (
            <div style={style.navigationContainer}>
                <ul className="list-inline" style={style.linksList}>
                    {links.map((link, index) => {

                        let targetURL = process.env.PUBLIC_URL + link.get("url");

                        return <li key={index}
                                   style={style.link}
                                   >
                                    <Link to={{ pathname:targetURL, query: context}}>
                                        {link.get("label")}
                                    </Link>
                               </li>;
                    })}
                </ul>
            </div>
        );
    }

    render() {
        const { configuration,
                error,
                fetching
        } = this.props;

        if (fetching) {
            return (
                <div>
                    <CircularProgress color="#eeeeee"/>
                    This dashboard component is loading the configuration file...
                </div>
            );
        }

        if (error) {
            return (
                <div>{error}</div>
            );
        }

        if (configuration) {
            const { visualizations, settings } = configuration.toJS();

            let filterOptions;

            if (configuration.get("filterOptions")) {
                filterOptions = Object.assign({}, defaultFilterOptions, configuration.get("filterOptions").toJS());
            }
            else {
                filterOptions = defaultFilterOptions;
            }

            let verticalCompact = true;
            if(settings && "verticalCompact" in settings) {
              verticalCompact = settings.verticalCompact;
            }

            return (
                <div>
                    {this.renderNavigationBarIfNeeded()}

                    <FiltersToolBar filterOptions={filterOptions} />

                    <div style={style.gridContainer}>
                        <ResponsiveReactGridLayout
                            rowHeight={10}
                            margin={[12,12]}
                            containerPadding={[10, 10]}
                            onResize={this.onResize.bind(this)}
                            onLayoutChange={this.onResize.bind(this)}
                            verticalCompact={verticalCompact}
                            >
                            {
                                visualizations.map((visualization) =>
                                    <div
                                        key={visualization.id}
                                        data-grid={visualization}
                                    >
                                        <Visualization
                                            id={visualization.id}
                                            registerResize={this.registerResize.bind(this)}
                                            showInDashboard={true}
                                        />
                                    </div>
                                )
                            }
                        </ResponsiveReactGridLayout>
                    </div>
                </div>
            );
        }

        return <div>No dashboard</div>;
    }
}


const mapStateToProps = (state, ownProps) => ({
    context: state.interface.get(InterfaceActionKeyStore.CONTEXT),

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
    }
});


export default connect(mapStateToProps, actionCreators)(DashboardView);
