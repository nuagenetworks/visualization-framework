/**
 * To sort array of objects by provided column and sorting order
 */

export default ({
    column,
    order,
    sequence = null
  }) => {
  return (a, b) => {
    let sortOrder = `${sequence ? 'SEQ' : ''}${order || 'ASC'}`
    
    const operations = {
      'ASC': () => +(a[column] > b[column]),
      'DESC': () => +(a[column] < b[column]),
      'SEQASC': () => (sequence.indexOf(a[column]) - sequence.indexOf(b[column])),
      'SEQDESC': () => (sequence.indexOf(b[column]) - sequence.indexOf(a[column]))
    }

    return a[column] === b[column]
      ? 0
      : operations[sortOrder]() || -1
  }
}
