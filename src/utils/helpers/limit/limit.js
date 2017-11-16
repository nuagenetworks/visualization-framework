/**
 * To limit the big arrays by specified limit
 * data - Input array
 * dimension - 
 * fields - Set of fields which must be retained and if numeric then sum, otherwise merge the array
 */

import sorter from "../sorter"
import limitIndex from "./limitIndex"
import merge from "../merge"

export default ({
    data,
    dimension = 'key',
    metric = 'total',
    order = 'DESC',
    limitOption: {
      type = 'percentage',
      minimum = 10,
      limit = null,
      fields = [],
      label
    } = {}
  }) => {

    if (!limit) {
      return data
    }

    /**
     * Sorting the array
     */
    let sortedData = data.slice().sort(sorter({
      column: metric,
      order: order
    }))

    let limitedData = [], othersData = []
    let counter

    if (!type || type === 'percentage') {
      
      counter = limitIndex({
        data,
        type,
        limit,
        metric
      })

      if(minimum && counter < minimum) {
        //counter = minimum
      }
    } else {
      counter = limit
    }

    limitedData = sortedData.slice(0, counter)
    othersData = sortedData.slice(counter)

    /**
     * Merging of Data
     */

    // Pushing of main metric column for aggregation
    fields.push({
      type: 'number',
      name: metric
    })

    let mergedData = merge({
      data: othersData,
      fields,
      dimension
    })
    
    return [
      ...limitedData, 
      Object.assign(
        {
          [dimension]: label
        },
        mergedData
      )
    ]
  }
