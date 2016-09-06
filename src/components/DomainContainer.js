import React from 'react';
import { connect } from 'react-redux';


import { Actions } from './redux/actions';

class DomainContainerView extends React.Component {
    componentWillMount() {
        this.props.setPageTitle(this.props.params.domainID);
    };

    componentWillReceiveProps(nextProps) {
        this.props.setPageTitle(nextProps.params.domainID);
    }

    render() {
        return (
            <div>
                <h1>Page for {this.props.params.domainID}</h1>
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


export default connect(mapStateToProps, actionCreators)(DomainContainerView);
