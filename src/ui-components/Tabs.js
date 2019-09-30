import React, { Component } from 'react';
import PropTypes from 'prop-types';

import style from './style';

class Tabs extends Component {
    state = { active: 0 };

    handleClick = (e) => {
        this.setState({ active: e.target.dataset.id });
    }

    isActive(index) {
        return index.toString() === this.state.active.toString();
    }

    render() {
        const { tabs } = this.props;
        const { active } = this.state;

        return (
            <div style={style.tabs}>
                <div style={style.tabsTop}>
                    {tabs.map(({ key, label }, index) => (
                        <button
                            key={key || index}
                            type="button"
                            style={(this.isActive(index)) ? style.tabButtonActive : style.tabButton}
                            data-id={index}
                            onClick={this.handleClick}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div style={style.tabsContent}>
                    {tabs[active] && tabs[active].content}
                </div>
            </div>
        );
    }
}

Tabs.propTypes = {
    tabs: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        key: PropTypes.string,
        content: PropTypes.node.isRequired,
    })).isRequired,
};

export default Tabs;
