
import config from '../../config'

const timeLabel = function() {

    let refreshInterval = config.REFRESH_INTERVAL;
    let seconds = Math.floor(refreshInterval / 1000);

    seconds +=  (seconds > 1) ? " seconds" : " second";

    return seconds;
}

export const defaultFilterOptions = {
    "Time interval": {
        "parameter": "startTime",
        "default": "now-24h",
        "options": [
            {
                "label": "Last 15 min",
                "value": "now-15m",
                "forceOptions": {
                    "interval": "1m",
                    "prevStartTime": "now-30m",
                    "unit": "m",
                    "duration": "15"
                }
            },
            {
                "label": "Last 24h",
                "value": "now-24h",
                "default": true,
                "forceOptions": {
                    "interval": "1h",
                    "prevStartTime": "now-48h",
                    "unit": "h",
                    "duration": "24"
                }
            },
            {
                "label": "Last 7 days",
                "value": "now-7d",
                "forceOptions": {
                    "interval": "12h",
                    "prevStartTime": "now-14d",
                    "unit": "d",
                    "duration": "7"
                }
            }
        ]
    },
    "Refresh interval": {
        "parameter": "refreshInterval",
        "default": "-1",
        "options": [
            {
                "label": "Inactive",
                "value": "-1",
            },
            {
                "label": timeLabel(),
                "value": config.REFRESH_INTERVAL.toString(),
            }
        ]
    }
}
