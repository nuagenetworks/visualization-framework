export const defaultFilterOptions = {
    "Time interval": {
        "parameter": "startTime",
        "default": "now-15m",
        "options": [
            {
                "label": "Last 15 min",
                "default": true,
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
                "label": "30 seconds",
                "value": "30000",
            }
        ]
    }
}
