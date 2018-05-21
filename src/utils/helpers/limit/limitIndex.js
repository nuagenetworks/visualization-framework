/**
 * To sort array of objects by provided column and sorting order
 * Must be done in the provided format - We dont arrange it in any order
 */
import { reducerSum } from "../"

export default ({
    data,
    type = 'percentage',
    limit,
    metric
    }) => {

    const total = reducerSum({
      data,
      column: metric
    })
    
    let sum = 0
    for(let index = 0; index < data.length; index++) {
      sum += +Number(data[index][metric])
      switch (type) {
        case 'sum':
          if(sum >= limit) {
            return index + 1;
          }
          break

        default:
          if(((sum / total) * 100) >= limit) {
            return index + 1;
          }
          break

      }
    }

    return -1
  }
