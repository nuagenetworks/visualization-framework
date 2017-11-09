/**
 * This will merge the array of Objects
 * 
 */
import { reducerSumByKeys } from "./"

export default ({
    data,
    fields
  }) => {
    let mergedData = {}

    fields.forEach(field => {
      switch(field.type) {
        case 'number':
          mergedData[field.name] = 0
          break
        default:
          mergedData[field.name] = []
          break
      }
    })

    data.forEach((d) => {
      
      fields.forEach(field => {
        switch(field.type) {
          case 'number':
              mergedData[field.name] += d[field.name]
            break

          case 'string':
            mergedData[field.name] = [...mergedData[field.name], d[field.name]]
            break

          default:
            mergedData[field.name] = [...mergedData[field.name], ...d[field.name]]
            break
        }
      })
    })
    
    fields.forEach(field => {
      if(field.groups && field.type === 'array') {
        mergedData[field.name] = reducerSumByKeys({
          data: mergedData[field.name],
          field
        })
      }
    })
    return mergedData
  }