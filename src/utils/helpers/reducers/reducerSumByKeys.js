/**
 * Field.metric - Array of properties or single column
 * 
 * Return the reduced array by grouped keys for all metrices
 * 
 * Input: 
 * data = [
 * {key1: 'A1', key2: 'B', value1: 10, value2: 20},
 * {key1: 'A1', key2: 'B', value1: 30, value2: 60}
 * {key1: 'A1', key2: 'C', value1: 10, value2: 20}
 * {key1: 'A2', key2: 'B', value1: 30, value2: 50}
 * {key1: 'A2', key2: 'B', value1: 10, value2: 20}
 * {key1: 'A2', key2: 'C', value1: 50, value2: 20}
 * ]
 * 
 * groups = ['key1', 'key2'],
 * metrics = ['value1', 'value2']
 * 
 * Output:
 * [
 * {key1: 'A1', key2: 'B', value1: 40, value2: 80},
 * {key1: 'A1', key2: 'C', value1: 10, value2: 20}
 * {key1: 'A2', key2: 'B', value1: 40, value2: 70}
 * {key1: 'A2', key2: 'C', value1: 50, value2: 20}
 * ]
 * 
 * Input
 * groups = [],
 * metrics = ['value1', 'value2']
 * 
 * Output:
 * [
 * {key1: 'A1', key2: 'B', value1: 140, value2: 190},
 * ]
 * 
 */

import { pick } from '../'

export default ({
    data,
    field: {
      groups = [],
      metrics
    }
  }) => {
    var o = {}

    if(typeof metrics !== 'object') {
      metrics = [metrics]
    }

    return data.reduce(function(r, e) {
      var key = groups.map(d => e[d]).join('|') || 'group'

      if (!o[key]) {

        o[key] = pick(e, ...[...groups, ...metrics])
        r.push(o[key])

      } else {
        metrics.forEach(metric => o[key][metric] += e[metric])
      }

      return r
    }, []);
  }
