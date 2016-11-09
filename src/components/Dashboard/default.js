export const defaultFilterOptions = {
    "Time interval": {
        "parameter": "startTime",
        "options": [
            {
                "label": "24h",
                "value": "now-24h",
                "default": true
            },
            {
                "label": "900h",
                "value": "now-900h"
            },
            {
                "label": "Last 7 days",
                "value": "now-7d"
            }
        ]
    },
    "Refresh interval": {
        "parameter": "refreshInterval",
        "default": 6000,
        "disabled": true,
        "options": [
            {
                "label": "60 seconds",
                "value": 6000,
                "disabled": true
            }
        ]
    }
}
