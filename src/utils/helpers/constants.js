// TODO split out this time interval log into a utility module.

// Time unit abbreviations from
// https://www.elastic.co/guide/en/elasticsearch/reference/current/common-options.html#time-units
// mapping onto D3 time intervals defined ad
// https://github.com/d3/d3-time#intervals
export const timeAbbreviations = {
    'y': 'utcYear',
    'M': 'utcMonth',
    'w': 'utcWeek',
    'd': 'utcDay',
    'h': 'utcHour',
    'm': 'utcMinute',
    's': 'utcSecond',
    'ms': 'utcMillisecond'
  }