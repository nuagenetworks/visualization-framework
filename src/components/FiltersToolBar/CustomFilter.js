import React from 'react';
import moment from 'moment/moment';

import { DateTimePicker } from '../../ui-components';
import objectPath from 'object-path';

export default class CustomFilter extends React.Component {

    formatSelectedDateTime = (startDate, endDate) => {
        const currentTimestamp = new Date().getTime() / 1000;
        const startTimeDiff = Math.round((currentTimestamp - startDate) / 60);
        const endTimeDiff = Math.round((currentTimestamp - endDate) / 60);

        return {
            startTime: `now-${startTimeDiff}m`,
            endTime: `now-${endTimeDiff}m`
        };
    }

    handleSubmit = (props) => {
        const {
            startDate,
            endDate,
            startTime,
            endTime,
            interval
        } = props;

        const startDateTime = moment(startDate.toISOString().split('T')[0] + " " + startTime.format('HH:mm')).format();
        const endDateTime = moment(endDate.toISOString().split('T')[0] + " " + endTime.format('HH:mm')).format();
        const fromDate = new Date(startDateTime);
        const toDate = new Date(endDateTime);
        const customFilters = this.formatSelectedDateTime(
            Math.round(fromDate.getTime() / 1000),
            Math.round(toDate.getTime() / 1000)
        );

        this.props.resetCustomFilter({
            startTime: objectPath.get(customFilters, 'startTime') || null,
            endTime: objectPath.get(customFilters, 'endTime') || null,
            interval: interval,
            formatStartTime: `${fromDate.toLocaleDateString()} ${fromDate.getHours()}:${fromDate.getMinutes()}`,
            formatEndTime: `${toDate.toLocaleDateString()} ${toDate.getHours()}:${toDate.getMinutes()}`
        });
    }

    toggleModal = () => {
        this.props.resetCustomFilter();
    }

    render() {
        return (
            <div>
                <DateTimePicker
                    showTime={true}
                    showInterval={true}
                    onHandleSubmit={this.handleSubmit}
                    onToggleModal={this.toggleModal}
                />
            </div>
        );
    }
}
