import  React from 'react';
import "react-filter-box/lib/react-filter-box.css";
import "./index.css";

import ReactFilterBox from "react-filter-box";

import AutoCompleteHandler from './AutoCompleteHandler';
import AdvancedResultProcessing from './AdvancedResultProcessing';

import CheckCircle  from 'react-icons/lib/fa/check-circle';
import TimeCircle  from 'react-icons/lib/fa/times-circle';
import SearchIcon  from 'react-icons/lib/fa/search';
  
export default class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            isOk: true,
        }

        // set props data
        this.options = this.props.options;
        this.data    = this.props.data;
        this.columns = this.props.columns ? this.props.columns : false;

        this.autoCompleteHandler = new AutoCompleteHandler(this.data, this.options);
    }

    onChange(query,result) {
        this.setState({
            isOk: !result.isError
        });
    }

    onParseOk(expressions) {
        var newData = new AdvancedResultProcessing(this.options, this.columns).process(this.data, expressions);
        this.props.handleSearch(newData);        
    }
    
    renderIcon() {
        var style = {
            marginTop: 10,
            marginLeft: 5
        }

        return this.state.isOk ? <CheckCircle size={20} color="green" style={style}/> : 
        <TimeCircle size={20} style={style} color="#a94442" />
    }

    render() {
        return (
           
        <div style={{display: "flex", margin: "10px"}}>
            <div className="filter">
                <ReactFilterBox
                    onChange={this.onChange.bind(this)}
                    autoCompleteHandler={this.autoCompleteHandler}
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
                <button type="submit" className="search-btn pull-left" disabled={!this.state.isOk}>
                    <SearchIcon size={16} color="#555555" />
                </button>
            </div>
        </div>
        )
    }
}