import React from "react";
import { connect } from "react-redux";
import { push } from "redux-router";

import { Actions } from "./redux/actions";

class VisualizationView extends React.Component {

    componentWillMount() {
        this.props.setPageTitle("Visualization");
    };

    render() {
        return (
            <div>This is the visualization component !</div>
        );
    }
}


const mapStateToProps = (state) => ({

});


const actionCreators = (dispatch) => ({
    setPageTitle: function(aTitle) {
        dispatch(Actions.updateTitle(aTitle));
    },
    goTo: function(link, filters) {
        dispatch(push({pathname:link, query:filters}));
    }
 });


export default connect(mapStateToProps, actionCreators)(VisualizationView);
