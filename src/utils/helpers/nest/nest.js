/**
 * Nesting - Grouping of elements by key and sorting of inner values
 */

import { nest, ascending } from "d3";
import { sorter } from "../"

export default ({
    data, 
    key, 
    sortColumn = null, 
    sortOrder = null
  }) => {

  return nest()
    .key(function(d) {return d[key]}).sortKeys(ascending)
    .sortValues(sortColumn 
        ? sorter({
            column: sortColumn, 
            order: sortOrder
          })
        : null)
    .entries(data)

}
