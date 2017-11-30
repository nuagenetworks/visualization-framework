/**
 * To select selected properties of object to be passed from 2nd parameter ownwards
 * 
 * Input: 
 * ({key1: 'A1', key2: 'B', value1: 10, value2: 20}, 'key1', 'key2', 'value1')
 *
 * Output:
 * {key1: 'A1', key2: 'B', 'value1': 10}
 */

export default (o, ...props) => Object.assign({}, ...props.map(prop => ({[prop]: o[prop]})))
