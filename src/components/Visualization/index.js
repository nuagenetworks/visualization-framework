import React from "react";
import { connect } from "react-redux";
import { push } from "redux-router";

import AppBar from "material-ui/AppBar";

import { Actions } from "./redux/actions";

import graph1 from "../../images/graph1.png"
import graph2 from "../../images/graph2.png"
import graph3 from "../../images/graph3.png"
import graph4 from "../../images/graph4.png"

function getGraph(name) {
    switch(name) {
        case "graph1":
            return graph1;
        case "graph2":
            return graph2;
        case "graph3":
            return graph3;
        case "graph4":
        default:
            return graph4;
    }
};


class VisualizationView extends React.Component {

    componentWillMount() {
        //this.props.setPageTitle("Visualization");
    };

    render() {
        let { id } = this.props;
        return (
            <div>
                <AppBar
                    title={id}
                    showMenuIconButton={false}
                    />
                <div>
                    <img src={getGraph(id)} alt={id} width="100%" height="100%" />
                </div>
                {id}
            </div>
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
