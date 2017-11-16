/**
 * Generate the stack of the array by adding two columns y0, y1 on provided array
 */

export default ({
    data,
  column,
  }) => {

  let sum = 0
  return data.map((d) => {
    let y0 = sum
    sum += +(d[column])

    return Object.assign({}, d, {
      y0: y0,
      y1: sum ? sum - 1 : 0
    })
  })
}
