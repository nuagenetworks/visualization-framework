/**
 * Generate the stack of the array by adding two columns y0, y1 on provided array
 */

export default ({
  data,
column,
}) => {

let sum = 0
let negativeSum = 0
let isNegative = false

return data.map((d, i) => {
  let y0 = 0
  isNegative = false

  if(d[column] < 0) {
    y0 = negativeSum < 0 ? negativeSum : 0
    negativeSum -= -(d[column]) - (i === 0 ? 1 : 0)
    isNegative = true
  } else {
    y0 = sum
    sum += +(d[column]) - (i === 0 ? 1 : 0)
  }

  return Object.assign({}, d, {
    y0: y0,
    y1: isNegative ? negativeSum : sum
  })
})
}
