import { format, timeFormat } from "d3";
const d3 = { format, timeFormat };

// Compute accessor functions that apply number and date formatters.
// Useful for presenting numbers in tables or tooltips.
const columnAccessor = ({ column, format, timeFormat }) => {
    const value = (d) => d[column];
    if(format){
        const formatter = d3.format(format);
        return (d) => formatter(value(d));
    } else if(timeFormat) {
        const formatter = d3.timeFormat(timeFormat);
        return (d) => formatter(new Date(value(d)));
    } else {
      return value;
    }
};

export default columnAccessor;
