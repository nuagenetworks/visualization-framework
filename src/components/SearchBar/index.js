import AbstractSearchBar from "./AbstractSearchBar";

export default class Search extends AbstractSearchBar {

    handleSearch(newData) {
        this.props.handleSearch(newData);
    }

}