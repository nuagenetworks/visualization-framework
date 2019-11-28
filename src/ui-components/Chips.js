import React from 'react';
import Chip from 'material-ui/Chip';

export default class Chips extends React.Component {

    onCancel = () => {
        const { onClose } = this.props;
        onClose(null);
    }

    render() {
        const { content, labelStyle, deleteIconStyle, backgroundColor, labelColor } = this.props;
        const labelCSS = labelStyle || { fontSize: 12 }
        const iconStyle = deleteIconStyle || '';
        const chipLabelColor = labelColor || '';

        return (
            <Chip
                onRequestDelete={this.onCancel}
                labelStyle={labelCSS}
                deleteIconStyle={iconStyle}
                backgroundColor={backgroundColor}
                labelColor={chipLabelColor}
            >
                {content}
            </Chip>
        );
    }
}
