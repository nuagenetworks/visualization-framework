import React from "react";
import { connect } from "react-redux";
import { push } from "redux-router";

import { Actions } from "../App/redux/actions";

import ReactGridLayout from "react-grid-layout";
import AppBar from "material-ui/AppBar";

import graph1 from "../../images/graph1.png"
import graph2 from "../../images/graph2.png"
import graph3 from "../../images/graph3.png"
import graph4 from "../../images/graph4.png"

import {theme} from "../../theme"

var style = {
    navBar: {
        background: theme.palette.primary2Color,
    },
    card: {
        border: theme.palette.thinBorder + theme.palette.primary2Color,
        borderRadius: theme.palette.smallBorderRadius,
    }
}


class PageContainerView extends React.Component {

    componentWillMount() {
        this.props.setPageTitle("Page Container - Dashboard Example");
    };

    render() {
        var layout = [
            {i: "graph1", x: 0, y: 0, w: 6, h: 22, minW:6, minH:22},
            {i: "graph2", x: 6, y: 0, w: 6, h: 22, minW:6, minH:22},
            {i: "graph3", x: 0, y: 22, w: 2, h: 16, minW:2, minH:16},
            {i: "graph4", x: 2, y: 22, w: 4, h: 16, minW:4, minH:16},
        ];

        return (
            <ReactGridLayout
                className="layout"
                layout={layout}
                cols={12}
                rowHeight={10}
                width={1200}
                >

                <div style={style.card} key={"graph1"} onTouchTap={() => {this.props.goTo("/zoom", {graph:1})}}>
                    <AppBar
                        title="Graph 1"
                        showMenuIconButton={false}
                        style={style.navBar}
                        />
                    <div>
                        <img src={graph1} alt="graph1" width="100%" height="100%" />
                    </div>
                    <footer className="text-center">
                        <small>This graph a graph legend...</small>
                    </footer>
                </div>

                <div style={style.card} key={"graph2"} onTouchTap={() => {this.props.goTo("/zoom", {graph:2})}}>
                    <AppBar
                        title="Graph 2"
                        showMenuIconButton={false}
                        style={style.navBar}
                        />
                    <div>
                        <img src={graph2} alt="graph2" width="100%" height="100%" />
                    </div>
                    <footer className="text-center">
                        <small>This graph a graph legend...</small>
                    </footer>
                </div>

                <div style={style.card} key={"graph3"} onTouchTap={() => {this.props.goTo("/zoom", {graph:3})}}>
                    <AppBar
                        title="Graph 3"
                        showMenuIconButton={false}
                        style={style.navBar}
                        />
                    <div>
                        <img src={graph3} alt="graph3" width="100%" height="100%" />
                    </div>
                    <footer className="text-center">
                        <small>This graph a graph legend...</small>
                    </footer>
                </div>

                <div style={style.card} key={"graph4"} onTouchTap={() => {this.props.goTo("/zoom", {graph:4})}}>
                    <AppBar
                        title="Graph 4"
                        showMenuIconButton={false}
                        style={style.navBar}
                        />
                    <div>
                        <img src={graph4} alt="graph4" width="100%" height="100%" />
                    </div>
                    <footer className="text-center">
                        <small>This graph a graph legend...</small>
                    </footer>
                </div>
            </ReactGridLayout>
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


export default connect(mapStateToProps, actionCreators)(PageContainerView);
