import React from 'react';
import { connect } from 'react-redux';

import NavBar from './NavBar.js'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {theme} from '../theme'

let style = {
    container: {
        margin: '20px',
    }
}

class AppContainerView extends React.Component {
    render() {
        return (
            <MuiThemeProvider muiTheme={theme}>
                <div>
                    <NavBar />
                    <div style={style.container}>
                        {this.props.children}
                    </div>
                </div>
            </MuiThemeProvider>
        );
    };
}


const mapStateToProps = (state) => ({

});


const actionCreators = (dispatch) => ({

 });


export default connect(mapStateToProps, actionCreators)(AppContainerView);
