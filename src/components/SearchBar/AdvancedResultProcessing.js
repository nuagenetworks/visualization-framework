import { SimpleResultProcessing } from "react-filter-box";
import columnAccessor from "../../utils/columnAccessor";

export default class AdvancedResultProcessing extends SimpleResultProcessing {

    constructor(props, columns = false) {
        super(props);
        this.columns = columns;
    }

    filter(row, fieldOrLabel, operator, value) {

        const field = this.tryToGetFieldCategory(fieldOrLabel);
        const searchedValue = value.toLowerCase();
        let originalValue = (row[field] || row[field] === 0) ? row[field].toString().toLowerCase() : ""

        if(this.columns) {
            let column = this.columns.find(function(d) {
                return d.column && d.column === field;
            });

            if(column) {
                const formattedValue = columnAccessor(column);
                originalValue = (formattedValue(row, true))

                if(['number', 'string', 'boolean'].includes(typeof(originalValue))) {
                    originalValue = originalValue.toString().toLowerCase()
                }
            }
        }

        switch(operator) {
            case "==": return originalValue === searchedValue;
            case "!=": return originalValue !== searchedValue;
            case "contains": return originalValue.indexOf(searchedValue) >=0;
            case "!contains": return originalValue.indexOf(searchedValue) <0;
            case "startsWith": return  originalValue.startsWith(searchedValue) ;
            default:
              return false;
            
        }
    }
}