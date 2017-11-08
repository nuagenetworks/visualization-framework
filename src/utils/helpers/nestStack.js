/**
 * Stacking of Nested Groups and calculating of overall sum
 */

import stack from "./stack"
import reducerSum from "./reducerSum"

export default ({
    data, 
    column = 'values',
    sumColumn = 'total',
    stackColumn
  }) => {

  return data.map((d) => {
    return Object.assign({}, d, {
        [column]: stack({
            data: d[column],
            column: stackColumn
        }),
        [sumColumn]: reducerSum({
            data: d[column],
            column: stackColumn
        })
      }
    )
  })

}
