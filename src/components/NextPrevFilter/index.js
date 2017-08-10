import React from "react";

import { push } from "redux-router";
import { connect } from "react-redux";
import FontAwesome from "react-fontawesome";

import {
    Actions as InterfaceActions,
    ActionKeyStore as InterfaceActionKeyStore
} from "../App/redux/actions";

import style from "./styles";


export class NextPrevFilter extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            page: 1,
            duration: 15,
            unit: "m",
            filterOptions: {
                "startTime": "startTime",
                "endTime": "endTime",
                "prevStartTime": "prevStartTime",
                "page": "page"
            }
        }
    }

    componentWillMount() {

        let page = this.props.context[`${this.props.visualizationId}-${this.state.filterOptions.page}`];
        if(page) {
            this.setState({page: parseInt(page)});
        }

        this.updateContextValue(this.props);
    }

    componentWillReceiveProps(nextProps) {

        if(this.props.context.interval !== nextProps.context.interval) {
            this.setState({page: 1});
            let finalContext = Object.assign({}, nextProps.context, {
                [`${nextProps.visualizationId}-${this.state.filterOptions.startTime}`] : nextProps.context.startTime,
                [`${nextProps.visualizationId}-${this.state.filterOptions.endTime}`] : 'now',
                [`${nextProps.visualizationId}-${this.state.filterOptions.prevStartTime}`]: (nextProps.context.prevStartTime) ? nextProps.context.prevStartTime : 0,
                [`${nextProps.visualizationId}-${this.state.filterOptions.page}`] : 1,
            });

            this.props.goTo(window.location.pathname, finalContext);
        }
        this.updateContextValue(nextProps);
    }

    updateContextValue(props) {
        const {
            context
        } = props;

        if(context.duration) {
            this.setState({duration: context.duration});
            this.setState({unit: context.unit});
        }
        
    }

    renderPrevIcon() {
        return (
            <button className="btn btn-xs btn-default"
              onTouchTap={() => { this.goToPrev() }}>
                <FontAwesome
                    name="play"
                    style={style.rotatePlay}
                    />
            </button>
        )
    }

    renderNextIcon() {
        let btnDisabled = true;
        if (this.state.page !== 1) {
           btnDisabled = false;
        }
        
        return (
            <button  className="btn btn-xs btn-default" disabled={btnDisabled} 
            onTouchTap={() => { this.goToNext() }}>
                <FontAwesome
                    name="play"
                />
            </button>
        )
    }

    goToNext() {

        const {
            context,
            visualizationId
        } = this.props

        if(this.state.page === 1) {
            return;
        }

        let startTime = `now-${(this.state.page - 1) * this.state.duration}`;
        let endTime = `now-${(this.state.page - 2) * this.state.duration}`;
        let prevStartTime = `now-${(this.state.page) * this.state.duration}`;

        this.setState({
            page: this.state.page - 1
        })

        let queryParams = Object.assign({}, context, {
                [`${visualizationId}-${this.state.filterOptions.startTime}`]: startTime + (this.state.unit),
                [`${visualizationId}-${this.state.filterOptions.endTime}`]: endTime + (this.state.unit),
                [`${visualizationId}-${this.state.filterOptions.prevStartTime}`]: prevStartTime + (this.state.unit),
                [`${visualizationId}-${this.state.filterOptions.page}`] : this.state.page - 1,
            });

        this.props.goTo(window.location.pathname, queryParams);
    }

    goToPrev() {

        const {
            context,
            visualizationId
        } = this.props

        let startTime = `now-${(this.state.page + 1) * this.state.duration}`;
        let endTime = `now-${(this.state.page) * this.state.duration}`;
        let prevStartTime = `now-${(this.state.page + 2) * this.state.duration}`;

        this.setState({
            page: this.state.page + 1
        });

        let queryParams = Object.assign({}, context, {
                [`${visualizationId}-${this.state.filterOptions.startTime}`]: startTime + (this.state.unit),
                [`${visualizationId}-${this.state.filterOptions.endTime}`]: endTime + (this.state.unit),
                [`${visualizationId}-${this.state.filterOptions.prevStartTime}`]: prevStartTime + (this.state.unit),
                [`${visualizationId}-${this.state.filterOptions.page}`] : this.state.page + 1,
            });

        this.props.goTo(window.location.pathname, queryParams);
    }


    renderFilter() {
        return (
                <ul className="list-inline" style={style.list}>
                    <li style={style.listItem}>{ this.renderPrevIcon() }</li>
                    <li style={style.listItem}>{ this.renderNextIcon() }</li>
                </ul>
            );
    }

    render() {
        const {
            nextPrevFilter
        } = this.props

        if (!nextPrevFilter)
            return (
                <div></div>
            );

        return (
            <div className="text-left">
                {this.renderFilter()}
            </div>    
        )
    }
}

NextPrevFilter.propTypes = {
    filterOptions: React.PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
    context: state.interface.get(InterfaceActionKeyStore.CONTEXT)
})

const actionCreators = (dispatch) => ({

    goTo: function(link, context) {
        dispatch(push({pathname:link, query:context}));
    },

    updateContext: function(context) {
        dispatch(InterfaceActions.updateContext(context));
    }

});

export default connect(mapStateToProps, actionCreators)(NextPrevFilter);
