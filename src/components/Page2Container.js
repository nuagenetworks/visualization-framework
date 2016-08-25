import React from 'react';
import { connect } from 'react-redux';

import graph1 from '../static/images/graph1.png'
import graph2 from '../static/images/graph2.png'
import graph3 from '../static/images/graph3.png'
import graph4 from '../static/images/graph4.png'

import { Actions } from './redux/actions';

class PageContainer2View extends React.Component {
    componentWillMount() {
        this.props.setPageTitle("Zoom");
    };

    graphFromNumber(graphNumber) {
        switch (parseInt(graphNumber, 10))
        {
            case 1:
                return graph1;
            case 2:
                return graph2;
            case 3:
                return graph3;
            case 4:
                return graph4;
            default:
                return;
        }
    }

    displayMessage(message, alertType = 'alert-info') {
        return (
            <div className={'alert ' + alertType}>
                {message}
            </div>
        );
    }

    render() {

        let graphNumber = this.props.location.query.graph;
        let currentGraph = this.graphFromNumber(graphNumber);
        let currentTitle = "Graph " + graphNumber;

        if (!currentGraph)
            return this.displayMessage("No graph provided");

        return (
            <div>
                <h1>{currentTitle}</h1>
                <img src={currentGraph} alt="{currentTitle}" width="80%" height="80%"/>
            </div>
        );
    }
}


const mapStateToProps = (state) => ({

});


const actionCreators = (dispatch) => ({
    setPageTitle: function(aTitle) {
        dispatch(Actions.updateTitle(aTitle));
    }
 });


export default connect(mapStateToProps, actionCreators)(PageContainer2View);
