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
 * column = 'value1'
 * 
 * Output:
 * 140
 *
 */

export default ({
    data,
    column = null
  }) => {
    
    return data.reduce((acc, curr) => {
        return acc + Number((column ? curr[column] : curr))
      }, 0);
  }
