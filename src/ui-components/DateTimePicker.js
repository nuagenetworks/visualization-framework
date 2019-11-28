import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DayPicker from 'react-day-picker';
import "react-day-picker/lib/style.css";
import "rc-time-picker/assets/index.css";
import TimePicker from 'rc-time-picker';
import moment from 'moment/moment';

import { Button, Modal, Interval } from '../ui-components';
import {
    DATE_RANGE,
    TIME_RANGE,
    DATE,
    TIME,
    START_TIME,
    END_TIME
} from '../config';
import style from './style';


class DateTimePicker extends Component {

    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            startDate: new Date(),
            endDate: null,
            startTime: moment().subtract(15, 'minutes'),
            endTime: moment(),
            modalOpen: true,
            isSubmitDisabled: true,
            dateRange: null,
            error: false,
            startDateTimestamp: null,
            endDateTimestamp: null,
            interval: null
        };
    }

    handleDateClick = (selectedDate) => {
        const { startDate } = this.state;
        let firstDate = null;
        
        const currentDate = moment(new Date().toISOString().split('T')[0]).valueOf();
        const newDate = moment(selectedDate.toISOString().split('T')[0]).valueOf();
        if(currentDate < newDate) {
            return;
        }

        const endDateTime = selectedDate.getTime();
        const startDateTime = startDate.getTime();
        if (startDateTime <= endDateTime) {
            if ((endDateTime - startDateTime) > DATE_RANGE) {
                firstDate = new Date(selectedDate - DATE_RANGE)
                this.setState({
                    startDate: firstDate,
                    endDate: selectedDate,
                    dateRange: selectedDate,
                });
            } else {
                this.setState({
                    endDate: selectedDate,
                    dateRange: selectedDate,
                });
            }
        } else {
            this.setState({
                startDate: selectedDate,
                endDate: null,
                dateRange: null
            });
        }
        this.handleError(selectedDate, DATE, null, firstDate);
    }

    handleResetClick = () => {
        this.setState(this.getInitialState());
    }

    handleStartTime = (time) => {
        if (time) {
            this.setState({ startTime: time });
            this.handleError(time, TIME, START_TIME);
        }
    }

    handleEndTime = (time) => {
        if (time) {
            this.setState({ endTime: time });
            this.handleError(time, TIME, END_TIME);
        }
    }

    handleError = (value, key, type = null, firstDate = null) => {
        let { startDate, startTime, endDate, endTime } = this.state;
        if (startDate && startTime) {
            let date, formatStartTime, formatEndTime;
            if(firstDate !== null) {
                startDate = firstDate;
            }

            if (key !== DATE && endDate === null) {
                endDate = startDate;
                this.setState({endDate: startDate})
            }

            if (key === TIME && type === END_TIME) {
                date = endDate;
                formatStartTime = startTime;
                formatEndTime = value;
            } else if (key === TIME && type === START_TIME) {
                date = endDate;
                formatStartTime = value;
                formatEndTime = endTime;
            } else {
                date = value;
                formatStartTime = startTime;
                formatEndTime = endTime;
            }
            const startDateTime = moment(startDate.toISOString().split('T')[0] + " " + formatStartTime.format('HH:mm')).format();
            const endDateTime = moment(date.toISOString().split('T')[0] + " " + formatEndTime.format('HH:mm')).format();
            const firstTime = new Date(startDateTime).getTime();
            const secondTime = new Date(endDateTime).getTime();
            const currentTime = new Date().getTime();;
            if ((secondTime - firstTime) < TIME_RANGE) {
                this.setState({ isSubmitDisabled : true , error: true});
            } else if(firstTime > currentTime || secondTime > currentTime) {
                this.setState({ isSubmitDisabled : true , error: true});
            } else {
                this.setState({
                    isSubmitDisabled: false,
                    error: false,
                    startDateTimestamp: firstTime,
                    endDateTimestamp: secondTime,
                    intervalDropdown: false
                });
            }
        }
    }

    renderTitle = () => (
        <div style={style.popupTitle}>
            <div>Custom Time</div>
            <sub>*<small>Minimun of 15 minutes and maximun of 7 days can be selected</small></sub>
        </div>
    )

    renderCalendar = () => {
        const { startDate, dateRange } = this.state;
        const modifiers = { start: startDate, end: dateRange };
        const selectedDays = [startDate, { from: startDate, to: dateRange }];

        return (
            <div id='dayPicker'>
                <DayPicker
                    disabledDays={[{
                        after: new Date(),
                    }]}
                    modifiers={modifiers}
                    showOutsideDays
                    selectedDays={selectedDays}
                    onDayClick={this.handleDateClick}
                />
            </div>
        )
    }

    renderTimePicker = () => {
        const { startTime, endTime } = this.state;

        return (
            <div id='timePicker'>
                <div style={{ paddingLeft: 24 }}>
                    <label>Select start time</label>
                    <TimePicker
                        id='startTime'
                        showSecond={false}
                        onChange={this.handleStartTime}
                        value={startTime}
                    />
                </div>
                <br />
                <div style={{ paddingLeft: 24 }}>
                    <label>Select end time</label>
                    <TimePicker
                        id='endTime'
                        showSecond={false}
                        onChange={this.handleEndTime}
                        value={endTime}
                    />
                </div>
            </div>
        )
    }

    renderFooter = () => {
        const {
            isSubmitDisabled,
            error,
        } = this.state;

        return (
            <div style={style.popupFooter}>
                <div style={{ float: 'right', padding: 10, }}>
                    <Button
                        id = 'apply'
                        primary
                        onClick={this.handleSubmit}
                        disabled={isSubmitDisabled}
                    >
                        Apply
                    </Button>
                </div>
                <div style={{ float: 'left', padding: 10, }}>
                    {!error && !isSubmitDisabled && (
                        <div>
                            <Button
                                id = 'reset'
                                style={{ fontSize: 12 }}
                                onClick={this.handleResetClick}
                            >
                                Reset
                            </Button>
                        </div>
                    )}
                </div>
            </div>

        );
    }

    handleSubmit = () => {
        const { startDate, endDate, startTime, endTime, interval } = this.state;
        this.props.onHandleSubmit({
            startDate: startDate,
            endDate: endDate,
            startTime: startTime,
            endTime: endTime,
            interval: interval
        });
    }

    getIntervals = (interval) => {
        this.setState({ interval });
    }

    closeModal = () => {
        this.setState({ modalOpen: false })
        this.props.onToggleModal();
    }

    render() {
        const { showTime, showInterval } = this.props;
        const {
            error,
            modalOpen,
            startDateTimestamp,
            endDateTimestamp,
        } = this.state;

        return (
            <div>
                <Modal
                    open={modalOpen}
                    onClose={this.closeModal}
                    title={this.renderTitle()}
                    width={'32%'}
                >
                    <div>
                        <div style={style.popupBody}>
                            <div>{this.renderCalendar()}</div>
                            <div>
                                {showTime && this.renderTimePicker()}
                                {showInterval &&
                                    <Interval
                                        getIntervals={this.getIntervals}
                                        startDate={startDateTimestamp}
                                        endDate={endDateTimestamp}
                                        isValid={!error}
                                    />
                                }
                            </div>

                        </div>
                        {this.renderFooter()}
                    </div>
                </Modal>
            </div>
        );
    }
}

DateTimePicker.propTypes = {
    props: PropTypes.object
};

export default DateTimePicker;
