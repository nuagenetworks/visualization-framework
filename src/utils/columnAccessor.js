import { format, timeFormat } from "d3";

const d3 = { format, timeFormat };

// Compute accessor functions that apply number and date formatters.
// Useful for presenting numbers in tables or tooltips.
const columnAccessor = ({ column, format, timeFormat, totalCharacters}) => {

    // Generate the accessor for nested values (e.g. "foo.bar").
    const keys = column.split(".");
    const value = (d) => keys.reduce((d, key) => d[key], d);
    // Apply number and date formatters.
    if(format){
        const formatter = d3.format(format);
        return (d) => formatter(value(d));
    } else if(timeFormat) {
        const formatter = d3.timeFormat(timeFormat);
        return (d) => formatter(new Date(value(d)));
    } else if(totalCharacters) {
        return (d, showTooltip) => {
           return showTooltip ? value(d) : value(d).substr(0,totalCharacters).concat('...') ;
        }
    } else {
      return value;
    }
};

export default columnAccessor;
