import React from "react";
import { connect } from "react-redux";

import NavBar from "./NavBar.js";
import MessageBox from "../MessageBox";

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { Card,
         CardHeader,
         CardText
} from 'material-ui/Card';

import { theme } from "../../theme";

import { ActionKeyStore as VSDActionKeyStore } from "../../configs/nuage/redux/actions";
import { getRequestID } from "../../configs/nuage/vsd";

let style = {
    container: {
        margin: "20px",
    }
}


class AppContainerView extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            initializing: true
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({initializing: false});
    }

    shouldShowApplication() {
        return this.state.initializing || (this.props.licenses && this.props.licenses.length > 0);
    }

    renderErrorMessage() {
        return (
            <div style={style.container}>
                <Card>
                    <CardHeader
                        title="Oops, it seems you are not connected !"
                        subtitle="See below explanation"
                        />
                        <CardText>
                            You need to be connected to the VSD in order to access this visualization application.
                            This may be due to one of the following issues:
                            <ul>
                                <li><strong>token</strong> or <strong>api</strong> are not specified in the URL</li>
                                <li><strong>No valid license</strong> has been found to access the VSD</li>
                            </ul>
                        </CardText>
                </Card>
            </div>
        );
    }

    renderApp() {
        return (
            <div>
                <NavBar />
                <MessageBox />
                <div style={style.container}>
                    {this.props.children}
                </div>
            </div>
        );
    }

    renderAppIfPossible(bla) {
        if (this.shouldShowApplication())
            return this.renderApp();

        return this.renderErrorMessage();
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={theme}>
                <div>
                    {this.renderAppIfPossible()}
                </div>
            </MuiThemeProvider>
        );
    };
}


const mapStateToProps = (state) => ({
    licenses: state.VSD.getIn([VSDActionKeyStore.REQUESTS, getRequestID("licenses"), VSDActionKeyStore.RESULTS]),
});


const actionCreators = (dispatch) => ({
 });


export default connect(mapStateToProps, actionCreators)(AppContainerView);
