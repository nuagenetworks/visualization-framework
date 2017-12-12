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
        super(props)

        this.state = {
            data: [],
            isOk: true,
            query: this.props.searchText || ''
        }

        const {
            options,
            data,
        } = this.props
        
        this.autoCompleteHandler = new AutoCompleteHandler(data, options)
    }

    componentDidMount () {
        const { query } = this.state
        console.log = () => {}

        if(query) {
            this.refs.filterBox.onSubmit(query)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return JSON.stringify(nextProps.data) !== JSON.stringify(this.props.data)
          || JSON.stringify(nextState) !== JSON.stringify(this.state)
    }

    componentDidUpdate () {
        const { query } = this.state
        this.refs.filterBox.onSubmit(query)
    }

    onChange (query, result) {
        this.setState({
            isOk: !result.isError,
            query
        })
    }

    onParseOk (expressions) {
        const {
            options,
            data,
            columns = false
        } = this.props

        const filteredData = new AdvancedResultProcessing(options, columns).process(data, expressions)
        this.props.handleSearch(filteredData)
    }
    
    renderIcon () {
        var style = {
            marginTop: 10,
            marginLeft: 5
        }

        return this.state.isOk ? <CheckCircle size={20} color="green" style={style}/> : 
        <TimeCircle size={20} style={style} color="#a94442" />
    }

    render() {
        const {
            query
        } = this.state

        const {
            options
        } = this.props

        return (
           
        <div style={{display: "flex", margin: "10px"}}>
            <div className="filter">
                <ReactFilterBox
                    ref="filterBox"
                    onChange={this.onChange.bind(this)}
                    autoCompleteHandler={this.autoCompleteHandler}
                    query={query}
                    options={options}
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