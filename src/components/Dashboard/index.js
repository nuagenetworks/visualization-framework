import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";

import CircularProgress from "material-ui/CircularProgress";
import { Responsive, WidthProvider } from "react-grid-layout";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

import { Tooltip } from 'redux-tooltip';

import Visualization from "../Visualization";
import FiltersToolBar from "../FiltersToolBar";

import {
    Actions as ConfigurationsActions,
    ActionKeyStore as ConfigurationsActionKeyStore
} from "../../services/configurations/redux/actions";

import {
    ActionKeyStore as InterfaceActionKeyStore,
    Actions as AppActions
} from "../App/redux/actions";

import { contextualize } from "../../utils/configurations"

import { defaultFilterOptions } from "./default.js"

import style from "./styles";
import "./style.css";

export class DashboardView extends React.Component {

    visualizationStatus = {}

    constructor(props) {
        super(props);
        this.resizeCallbacks = [];
        this.state = {
            hideViz: false
        }

        this.updateVisualization = this.updateVisualization.bind(this)
    }

    componentWillMount() {
        this.props.setPageTitle("Dashboard");
        this.updateConfiguration();
    }

    componentWillUnmount() {
        this.resizeCallbacks = null;
    }

    componentWillReceiveProps(nextProps) {
        const {
            configuration
        } = nextProps

        if(configuration) {
            let vizList = {}
            const {visualizations} = configuration.toJS()

            // Update all visualizations status "true" on first load
            if(visualizations && visualizations.length && visualizations.length !== this.visualizationStatus.length) {
                visualizations.forEach( d => {
                    this.visualizationStatus[d.id] = true
                })
            }
        }
    }

    componentDidUpdate(prevProps) {
        this.updateTitleIfNecessary(prevProps);
        this.updateTitleIconIfNecessary(prevProps);
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

        setPageTitle(this.currentTitle() || 'Dashboard');
    }

    updateTitleIconIfNecessary(prevProps) {
        const { configuration, setPageTitleIcon } = this.props;

        if (!configuration)
            return;

        const titleIcon = configuration.get("titleIcon");

        if (!titleIcon)
            return ;

        setPageTitleIcon(titleIcon);
    }

    updateConfiguration() {
        const {
            params,
            fetchConfigurationIfNeeded
        } = this.props

        if (!params.id)
            return;

        fetchConfigurationIfNeeded(params.id)
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
            context,
            filterContext
        } = this.props;

        const links = configuration.get("links");

        if (!links || links.count() === 0)
            return;

        const currentUrl = window.location.pathname;
        let contextWithFilter = Object.assign({}, context, filterContext)

        return (
            <div style={style.navigationContainer}>
                <ul className="list-inline" style={style.linksList}>
                    {links.map((link, index) => {

                        let targetURL = process.env.PUBLIC_URL + link.get("url");
                        let highlight = currentUrl === link.get("url") ? style.activeLink : style.link;

                        return <li key={index}
                                   style={highlight}
                                   >
                                    <Link to={{ pathname:targetURL, query: contextWithFilter}}
                                    style={style.noneTextDecoration}
                                    >
                                        {link.get("label")}
                                    </Link>
                               </li>;
                    })}
                </ul>
            </div>
        );
    }

    updateVisualization(id) {
        if(this.visualizationStatus.hasOwnProperty(id)) {
            this.visualizationStatus[id] = false

            let hideViz = true
            for (let index in this.visualizationStatus) {
                if(this.visualizationStatus.hasOwnProperty(index) && this.visualizationStatus[index] === true) {
                    hideViz = false
                }
            }

            if(hideViz) {
                this.setState({hideViz})
            }
        }

    }

    renderVisualizationIfNeeded(visualizations, verticalCompact) {

        const {
            params
        } = this.props

        return (
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
                                    updateVisualization={this.updateVisualization}
                                />
                            </div>
                        )
                    }
                </ResponsiveReactGridLayout>
            </div>
        )
    }

    renderMessage(message) {
        return (
            <div style={{display: "table", width: screen.availWidth, height: screen.availHeight - 200}}>
                <div className="center-content" style={{fontSize: '18px', fontWeight: 500, color:"rgb(107, 107, 107)"}}>
                   {message}
                </div>
            </div>
        )
    }

    render() {
        const { configuration,
                error,
                fetching,
                params
        } = this.props;

        if (fetching) {
            let loaderMessage = (<div>
                <CircularProgress color="#eeeeee"/>
                This dashboard component is loading the configuration file...
            </div>)
            return this.renderMessage(loaderMessage);
        }

        if (error) {
            return this.renderMessage(error);
        }

        if (configuration) {
            const { visualizations, settings } = configuration.toJS();

            let verticalCompact = true;
            if(settings && "verticalCompact" in settings) {
              verticalCompact = settings.verticalCompact;
            }

            let message = null
            if(this.state.hideViz) {
                message =  this.renderMessage('Oops, something went wrong')
            }

            let filterOptions;

            if (configuration.get("defaultFilterOptionsOverride")) {
                filterOptions = configuration.get("defaultFilterOptionsOverride").toJS();
            } 
            else {
                if (configuration.get("filterOptions")) {
                    filterOptions = Object.assign({}, defaultFilterOptions, configuration.get("filterOptions").toJS());
                }
                else {
                    filterOptions = defaultFilterOptions;
                }
            }

            return (
                <div>
                    {this.renderNavigationBarIfNeeded()}
                    <FiltersToolBar filterOptions={filterOptions} />
                    <Tooltip className='tooltip-container'/>
                    {message || this.renderVisualizationIfNeeded(visualizations, verticalCompact)}
                </div>
            );
        }

        return this.renderMessage('No dashboard')
    }
}


const mapStateToProps = (state, ownProps) => ({
    context: state.interface.get(InterfaceActionKeyStore.CONTEXT),

    filterContext: state.interface.get(InterfaceActionKeyStore.FILTER_CONTEXT),

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

    setPageTitleIcon: (aTitleIcon) => {
        dispatch(AppActions.updateTitleIcon(aTitleIcon));
    },

    fetchConfigurationIfNeeded: (id) => {
        return dispatch(ConfigurationsActions.fetchIfNeeded(
            id,
            ConfigurationsActionKeyStore.DASHBOARDS
        ));
    }
});


export default connect(mapStateToProps, actionCreators)(DashboardView);
