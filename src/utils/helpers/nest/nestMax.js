/**
 * Stacking of Nested Groups and calculating of overall sum
 */
import { max } from 'd3'

export default ({
    data, 
    column = 'values',
    maxColumn = 'max',
    sortColumn
  }) => {

  return data.map((d) => {
    return Object.assign({}, d, {
        [maxColumn]: max(d[column], (o) => o[sortColumn])
      }
    )
  })

}
