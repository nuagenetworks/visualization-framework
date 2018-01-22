/**
 * Remove null, undefined, 0 records from an array
 *
 * Input:
 * data: [{key1: 'A1', key2: 'B', value1: null, value2: 20},
 *  {key1: 'A1', key2: 'B', value1: 10, value2: 20},
 *  {key1: 'A1', key2: 'B', value1: undefined, value2: 20},
 * ]
 * column: value1
 *
 * Output:
 * [{key1: 'A1', key2: 'B', value1: 10, value2: 20}]
 */

export default ({
    data,
    column
}) => data.filter( d => !['null', null, false, 0, 'undefined', "0"].includes(d[column]))