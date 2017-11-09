/**
 * Stacking of Nested Groups and calculating of overall sum
 */
import { reducerSum } from "../"

export default ({
    data, 
    column = 'values',
    sumColumn = 'total',
    stackColumn
  }) => {

  return data.map((d) => {
    return Object.assign({}, d, {
        [sumColumn]: reducerSum({
            data: d[column],
            column: stackColumn
        })
      }
    )
  })

}
