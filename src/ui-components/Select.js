import React from 'react';
import PropTypes from 'prop-types';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import inputHOC from './inputHOC';
import style from './style';

class SelectInput extends React.Component {
    constructor(args) {
        super(args);
        this.state = { selectedValue: '' };
    }

    componentWillMount() {
        if (this.props.value) {
            this.setState ({ selectedValue: this.props.value });
        }
    }

    handleChange = (e, index, selectedValue) => {
        const { onChange } = this.props;
        return this.setState({ selectedValue }, () => onChange(selectedValue));
    }

    render() {
        const { label, options, hintText =  'Select a value', meta, error } = this.props;
        const { selectedValue } = this.state;
        let errorInfo = undefined;
        //this is a server error coming from the store
        if (error) {
            errorInfo = error;
        }
        // this is a field client side validation error
        else if (meta && meta.touched && meta.error) {
            errorInfo = meta.error;
        }

        const errorSpan = errorInfo ? <span style={style.errorSpan}>{errorInfo}</span> : null;

        const selectField = (
            <SelectField
                label={label}
                value={selectedValue}
                onChange={this.handleChange}
                hintText={hintText}
                style={style.select}
                hintStyle={style.selectHint}
                labelStyle={style.selectLabel}
                menuStyle={style.selectMenu}
                menuItemStyle={style.selectMenuItem}
                selectedMenuItemStyle={style.selectedMenuItem}
                underlineStyle={{ display: 'none' }}
                iconStyle={style.selectIcon}
                fullWidth={true}
            >
            {options.map(option => (
                <MenuItem key={option.value} value={option.value} primaryText={option.text} />
            ))}
            </SelectField>
        );

        return (
            <div>
                {selectField}
                {errorSpan}
            </div>
        );
    }
};

SelectInput.defaultProps = {
    action: null,
    input: undefined,
    label: '',
    type: 'text',
    value: undefined,
    onChange() {},
};

SelectInput.propTypes = {
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
    options: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func,
};

export default inputHOC(SelectInput);
