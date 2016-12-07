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
                    "prevStartTime": "now-30m"
                }
            },
            {
                "label": "Last 24h",
                "value": "now-24h",
                "default": true,
                "forceOptions": {
                    "interval": "1h",
                    "prevStartTime": "now-48h"
                }
            },
            {
                "label": "Last 7 days",
                "value": "now-7d",
                "forceOptions": {
                    "interval": "12h",
                    "prevStartTime": "now-14d"
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
                "value": "3000",
            }
        ]
    }
}
