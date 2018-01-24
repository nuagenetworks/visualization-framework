/**
 * Stacking of Nested Groups and calculating of overall sum of negative and positive values respectively
 */
import { reducerSum } from "../"

export default ({
    data,
  column = 'values',
  min = 'min',
  max = 'max',
  sumColumn = 'total',
  stackColumn
  }) => {

  return data.map((datum) => {
    let sumMin = 0, sumMax = 0

    datum[column].map((d, i) => {
      if (d[stackColumn] < 0) {
        sumMin -= -(d[stackColumn]) - (i === 0 ? 1 : 0)
      } else {
        sumMax += +(d[stackColumn]) - (i === 0 ? 1 : 0)
      }
    })

    return Object.assign({}, datum, {
      [min]: sumMin,
      [max]: sumMax,
      [sumColumn]: reducerSum({
        data: datum[column],
        column: stackColumn
      })
    }
    )
  })

}
