import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { push } from "redux-router";

import { CardOverlay } from "../CardOverlay";
import { Card, CardText } from 'material-ui/Card';

import { Actions } from "./redux/actions";
import {
    Actions as ServiceActions,
    ActionKeyStore as ServiceActionKeyStore
} from "../../services/servicemanager/redux/actions";
import {
    Actions as ConfigurationsActions,
    ActionKeyStore as ConfigurationsActionKeyStore
} from "../../services/configurations/redux/actions";

import { resizeVisualization } from "../../utils/resize"

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
        }
    }

    componentWillMount() {
        this.initialize(this.props.id);
    }

    componentDidMount() {
        this.updateSize();

        // If present, register the resize callback
        // to respond to interactive resizes from react-grid-layout.
        if (this.props.registerResize) {
            this.props.registerResize(this.updateSize.bind(this))
        }
    }

    componentWillReceiveProps(nextProps) {
        this.initialize(nextProps.id);
    }

    componentDidUpdate() {
        this.updateSize();
    }

    updateSize() {
        if (this._element) {
            const { width, height } = resizeVisualization(this._element);

            if (width !== this.state.width || height !== this.state.height) {
                this.setState({ width, height });
            }
        }
    }

    initialize(id) {

        this.props.fetchConfigurationIfNeeded(id).then((c) => {
            const { configuration } = this.props

            if (!configuration)
                return;

            const queryName  = configuration.get("query"),
                  scriptName = configuration.get("script");

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
                        },
                    );
                });
            }

        });
    }

    shouldShowVisualization() {
        const { configuration, response } = this.props;

        return configuration && response && !response.isFetching;
    }

    renderVisualization() {
        const { configuration, queryConfiguration, response } = this.props;

        const graphName      = configuration.get("graph"),
              GraphComponent = GraphManager.getGraphComponent(graphName);

        let description;

        if (this.state.showDescription) {
            description = <CardOverlay
                                overlayStyle={style.descriptionContainer}
                                textStyle={style.descriptionText}
                                text={configuration.get("description")}
                                onTouchTapOverlay={() => { this.setState({showDescription: false}); }}
                                />
        }

        return (
            <div>
                <GraphComponent
                  response={response}
                  configuration={configuration.toJS()}
                  queryConfiguration={queryConfiguration}
                  width={this.state.width}
                  height={this.state.height}
                />
                {description}
            </div>
        )
    }

    renderVisualizationIfNeeded() {
        if (this.shouldShowVisualization()) {
            return this.renderVisualization();
        }

        if (!this.state.parameterizable) {
            return (
                <CardOverlay
                    overlayStyle={style.overlayContainer}
                    textStyle={style.overlayText}
                    text={(
                        <div>
                            <FontAwesome
                                name="meh-o"
                                size="2x"
                                />
                            <br></br>
                            Oops, we are missing some parameters here!
                        </div>
                    )}
                    onTouchTapOverlay={() => { this.setState({showDescription: false}); }}
                    />
            )
        }

        return (
            <div style={style.container}>
                <div style={style.text}>
                    <FontAwesome
                        name="circle-o-notch"
                        spin
                        />
                    <br></br>
                    Please wait while loading...
                </div>
            </div>
        )
    }

    shouldShowTitle() {
        const { configuration } = this.props;

        return configuration && configuration.get("title") && this.state.parameterizable;
    }

    renderTitleIfNeeded() {
        const { configuration } = this.props;

        if (!this.shouldShowTitle())
            return;

        const descriptionIcon = !configuration.get("description") ? null : (
            <div className="pull-right">
                <FontAwesome
                    name="info-circle"
                    onTouchTap={() => { this.setState({showDescription: !!configuration.get("description")}); }}
                    />
            </div>
        )

        return (
            <div style={style.cardTitle}>
                {configuration.get("title")}
                {descriptionIcon}
            </div>
        )
    }

    cardTextReference = (c) => {
        if (this._element)
            return;

        this._element = ReactDOM.findDOMNode(c).parentElement;
    }

    render() {
        return (
            <Card
              style={style.card}
              containerStyle={style.cardContainer}
              ref={this.cardTextReference}
            >
                { this.renderTitleIfNeeded() };
                <CardText style={style.cardText}>
                    { this.renderVisualizationIfNeeded() }
                </CardText>
            </Card>
        );
    }
}

const mapStateToProps = (state, ownProps) => {

    const configurationID = ownProps.id || ownProps.params.id,
          context         = ownProps.context || ownProps.location.query;

    const props = {
        id: configurationID,
        context: context,

        configuration: state.configurations.getIn([
            ConfigurationsActionKeyStore.VISUALIZATIONS,
            configurationID,
            ConfigurationsActionKeyStore.DATA
        ]),

        error: state.configurations.getIn([
            ConfigurationsActionKeyStore.VISUALIZATIONS,
            configurationID,
            ConfigurationsActionKeyStore.ERROR
        ])

    };

    // Expose the query template as a JS object if it is available.
    if (props.configuration) {
        const queryConfiguration = state.configurations.getIn([
            ConfigurationsActionKeyStore.QUERIES,
            props.configuration.get("query")
        ]);

        if (queryConfiguration && !queryConfiguration.get(
            ConfigurationsActionKeyStore.IS_FETCHING
        )) {
            props.queryConfiguration = queryConfiguration.get(
                ConfigurationsActionKeyStore.DATA
            ).toJS();
        }

        const scriptName = props.configuration.get("script");
        
        // Expose received response if it is available
        if (props.queryConfiguration || scriptName) {
            const requestID = ServiceManager.getRequestID(props.queryConfiguration || scriptName, context);

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
        dispatch(Actions.updateTitle(aTitle));
    },

    goTo: function(link, filters) {
        dispatch(push({pathname:link, query:filters}));
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
