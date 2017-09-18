import  React from 'react';
import "react-filter-box/lib/react-filter-box.css";
import "./index.css";

import ReactFilterBox, { SimpleResultProcessing, GridDataAutoCompleteHandler} from "react-filter-box";

 import CheckCircle  from 'react-icons/lib/fa/check-circle';
 import TimeCircle  from 'react-icons/lib/fa/times-circle';
 import SearchIcon  from 'react-icons/lib/fa/search';
 import columnAccessor from "../../utils/columnAccessor";
 

//extend this class to add your custom operator
export class CustomAutoComplete extends GridDataAutoCompleteHandler {
    
    // override this method to add new your operator
    needOperators(parsedCategory) {
        var result = super.needOperators(parsedCategory);
        return result.concat(["startsWith"]);
    }

    //override to custom to indicate you want to show your custom date time
    needValues(parsedCategory, parsedOperator) {
        // if(parsedOperator === "after") {
        //     return [{ customType:"date"}]
        // }

        return super.needValues(parsedCategory, parsedOperator);
    }
}

export class CustomResultProcessing extends SimpleResultProcessing {

    constructor(props, columns = false) {
        super(props);
        this.columns = columns;
    }

    // override this method
    filter(row, fieldOrLabel, operator, value) {

        const field = this.tryToGetFieldCategory(fieldOrLabel);
        const searchedValue = value.toLowerCase();
        let originalValue = (row[field]) ? row[field].toString().toLowerCase() : "";

        if(this.columns) {

            let column = this.columns.find(function(d) {
                return d.column && d.column === field;
            });

            if(column) {
                const formattedValue = columnAccessor(column);
                originalValue = (formattedValue(row, true)) ? formattedValue(row, true).toString().toLowerCase() : "";  
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
    
export default class AbstractSearchBar extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            data:[],
            isOk:true,
        }

        // set props data
        this.options   = this.props.options;
        this.data      = this.props.data;
        this.columns = this.props.columns ? this.props.columns : false;

        this.customAutoComplete = new CustomAutoComplete(this.data, this.options);
    }

    onChange(query,result) {
        this.setState({isOk:!result.isError})
    }

    renderIcon() {
        var style = {
            marginTop: 10,
            marginLeft:5
        }
        return this.state.isOk ? <CheckCircle size={20} color="green" style={style}/> : 
        <TimeCircle size={20} style={style} color="#a94442" />
    }

    //customer your rendering item in auto complete
    customRenderCompletionItem(self, data, registerAndGetPickFunc) {
        var className = ` hint-value cm-${data.type}`        
        return <div className={className}  >
                    <span style={{ fontWeight: "bold" }}>{data.value}</span>
                    <span style={{color:"gray", fontSize:10}}> [{data.type}] </span>
                </div>
    }

    onParseOk(expressions) {
        var newData = new CustomResultProcessing(this.options, this.columns).process(this.data, expressions);
        this.handleSearch(newData);        
    }

    renderSubmitBtn() {
        return <button type="submit" className="search-btn pull-left" disabled={!this.state.isOk}>
            <SearchIcon size={16} color="#555555" />
        </button>
    }

    render() {
        return (
           
        <div style={{display: "flex", margin: "10px"}}>
            <div className="filter">
                <ReactFilterBox
                refs 
                    onChange={this.onChange.bind(this)}
                    autoCompleteHandler={this.customAutoComplete}
                    customRenderCompletionItem={this.customRenderCompletionItem.bind(this) }
                    query={this.state.query}
                    data={this.data}
                    options={this.options}
                    onParseOk={this.onParseOk.bind(this) }
                />

                <div className="filter-icon">
                { this.renderIcon() }
                </div>    
            </div>
            
            <div style={{flex: "none"}}>
                { this.renderSubmitBtn() }
            </div>
        </div>
        )
    }
}