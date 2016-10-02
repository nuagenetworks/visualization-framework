export const defaultFilterOptions = {
    "Time interval": {
        "parameter": "startTime",
        "default": "now-24h",
        "options": [
            {
                "label": "Last 15 min",
                "value": "now-15m",
            },
            {
                "label": "Last 24h",
                "value": "now-24h",
                "default": true
            },
            {
                "label": "Last 7 days",
                "value": "now-7d"
            }
        ]
    },
    "Refresh interval": {
        "parameter": "refreshInterval",
        "default": 3000,
        "disabled": true,
        "options": [
            {
                "label": "30 seconds",
                "value": 3000,
                "disabled": true
            }
        ]
    }
}
