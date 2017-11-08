export default ({
    data,
    column = null
  }) => {
    
    return data.reduce((acc, curr) => {
        return acc + (column ? curr[column] : curr)
      }, 0);
  }
