import React from 'react';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import style from './style';
import { INTERVAL_LIST } from '../config';



export default class Interval extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showInterval: false,
            interval: null,
            intervalList: [],
        };
    }

    static getDerivedStateFromProps(nextProps, state) {
        if (nextProps.startDate != null) {
            return Interval.getInterval(nextProps, state); 
        }
        
        if(nextProps.startDate === null) {
            return { showInterval : false };
        }
        
        return null;
    }

    static getIntervalList = (startDate, endDate) => INTERVAL_LIST.filter(interval => Interval.isInRange(interval, (endDate - startDate)));

    static isInRange = (timeInterval, timeDiffrence) => {
        const interval = Math.round(timeDiffrence / timeInterval);
        if (interval <= 30 && interval >= 5) {
            return interval;
        }
    }

    static getInterval = (props, state) => {
        const { startDate, endDate, isValid } = props;
        const { interval } = state;
        const intervalList = [];

        if (startDate && endDate && isValid) {
            const intervals = Interval.getIntervalList(Math.round(startDate / 1000), Math.round(endDate / 1000));
            intervals.forEach(interval => {

                let filter = {};
                if (interval >= 3600) {
                    const hours = interval / 3600;
                    filter = {
                        label: `${hours} hours`,
                        value: `${hours}h`,
                    };
                } else if (interval >= 60) {
                    const min = interval / 60;
                    filter = {
                        label: `${min} min`,
                        value: `${min}m`,
                    };
                }
                intervalList.push(filter);
            });
        }

        const isIntervalList = intervalList.length;
        return {
            showInterval: isIntervalList,
            intervalList,
            interval: interval && isIntervalList ? interval : null,
        };
    }

    onTouchTap = (interval) => {
        this.setState({ interval });
        this.props.getIntervals(interval);
    }

    render () {
        const { showInterval, intervalList, interval } = this.state;

        return (
            <div id='interval'>
                <DropDownMenu
                    name='Select Interval'
                    value={interval || 'interval'}
                    style={style.dropdownMenu}
                    disabled={!showInterval}
                    underlineStyle={style.underline}
                    labelStyle={style.menuLabel}
                    iconStyle={style.icon}
                >
                    <MenuItem
                        value={'interval'}
                        primaryText={'Select Interval'}
                        disabled={true}
                    />
                    {intervalList.map((interval, key) => {
                        return (
                            <MenuItem
                                key={key}
                                value={interval.value}
                                primaryText={interval.label}
                                disabled={false}
                                onClick={() => this.onTouchTap(interval.value)}
                            />
                        )
                    })}
                </DropDownMenu>
            </div>
        );
    }
}
