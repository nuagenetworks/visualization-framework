import React from "react";
import PropTypes from "prop-types";

import { push } from "react-router-redux";
import { connect } from "react-redux";
import FontAwesome from "react-fontawesome";
import queryString from "query-string";

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
            duration: "15",
            unit: "m",
            filterOptions: {
                "startTime": "startTime",
                "endTime": "endTime",
                "prevStartTime": "prevStartTime",
                "page": "page"
            }
        }
    }

    removeHyphens(value) {
      return value.replace(/-/g, '');
    }

    componentWillMount() {
        let filteredID = this.removeHyphens(this.props.visualizationId);

        let page = this.props.context[`${filteredID}${this.state.filterOptions.page}`];
        if(page) {
            this.setState({page: parseInt(page, 10)});
        }

        this.updateContextValue(this.props);
    }

    componentWillReceiveProps(nextProps) {
        let filteredID = this.removeHyphens(nextProps.visualizationId);
        if(this.props.context.duration !== nextProps.context.duration) {
            this.setState({page: 1});
            let finalContext = Object.assign({}, nextProps.context, {
                [`${filteredID}${this.state.filterOptions.startTime}`] : nextProps.context.startTime,
                [`${filteredID}${this.state.filterOptions.endTime}`] : 'now',
                [`${filteredID}${this.state.filterOptions.prevStartTime}`]: (nextProps.context.prevStartTime) ? nextProps.context.prevStartTime : 0,
                [`${filteredID}${this.state.filterOptions.page}`] : 1,
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
            this.setState({
                duration: parseInt(context.duration, 10),
                unit: context.unit
            });
        }

    }

    renderPrevIcon() {
        return (
            <button className="btn btn-xs btn-default"
            onClick={() => { this.goToPrev() }}>
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
            onClick={() => { this.goToNext() }}>
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

        let filteredID = this.removeHyphens(visualizationId);
        let queryParams = Object.assign({}, context, {
                [`${filteredID}${this.state.filterOptions.startTime}`]: startTime + (this.state.unit),
                [`${filteredID}${this.state.filterOptions.endTime}`]: endTime + (this.state.unit),
                [`${filteredID}${this.state.filterOptions.prevStartTime}`]: prevStartTime + (this.state.unit),
                [`${filteredID}${this.state.filterOptions.page}`] : this.state.page - 1,
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

        let filteredID = this.removeHyphens(visualizationId);
        let queryParams = Object.assign({}, context, {
                [`${filteredID}${this.state.filterOptions.startTime}`]: startTime + (this.state.unit),
                [`${filteredID}${this.state.filterOptions.endTime}`]: endTime + (this.state.unit),
                [`${filteredID}${this.state.filterOptions.prevStartTime}`]: prevStartTime + (this.state.unit),
                [`${filteredID}${this.state.filterOptions.page}`] : this.state.page + 1,
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
    filterOptions: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
    context: state.interface.get(InterfaceActionKeyStore.CONTEXT)
})

const actionCreators = (dispatch) => ({

    goTo: function(link, context) {
        dispatch(push({pathname:link, search:queryString.stringify(context)}));
    },

    updateContext: function(context) {
        dispatch(InterfaceActions.updateContext(context));
    }

});

export default connect(mapStateToProps, actionCreators)(NextPrevFilter);
