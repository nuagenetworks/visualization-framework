/**
 * To sort array of objects by provided column and sorting order
 */

export default ({
    column,
    order
  }) => {
  return (a, b) => {
    let sortOrder = order || 'ASC'
    const operations = {
      'ASC': () => +(a[column] > b[column]),
      'DESC': () => +(a[column] < b[column])
    }

    return a[column] === b[column]
      ? 0
      : operations[sortOrder]() || -1
  }
}
