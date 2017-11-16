import { GridDataAutoCompleteHandler } from "react-filter-box";

export default class AutoCompleteHandler extends GridDataAutoCompleteHandler {
    needOperators(parsedCategory) {
        var result = super.needOperators(parsedCategory);
        return result.concat(["startsWith"]);
    }
}