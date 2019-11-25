import React from 'react';
import PropTypes from 'prop-types';

import { Form, Columns, Label } from '../../ui-components';

const TwoColumnRow = (props) => {
    const { firstColumnProps, secondColumnProps } = props;
    const col = { name: null, label: null, component: null};
    const { name: firstColName, label: firstColLabel, component: firstColComponent, text:firstColText, ...firstColRest } = firstColumnProps ? firstColumnProps : col;
    const firstColDisplayLabel = firstColumnProps && firstColLabel && !firstColumnProps.hideLabel;

    const { name: secondColName, label: secondColLabel, component: secondColComponent, text:secondColText, ...secondColRest } = secondColumnProps ? secondColumnProps : col;
    const secondColDisplayLabel = secondColumnProps && secondColLabel && !secondColumnProps.hideLabel;
    return (
        <Columns>
            <Columns.Column width="15%">
                {firstColDisplayLabel && <Label>{firstColLabel}</Label>}
            </Columns.Column>
            <Columns.Column width="32%">
                { firstColumnProps && !firstColText && firstColComponent &&
                    <Form.Field
                        name={firstColName}
                        label={firstColLabel}
                        component={firstColComponent}
                        {...firstColRest}
                    />
                }
                { firstColumnProps && firstColText &&
                    <span>{firstColText}</span>
                }
            </Columns.Column>
            <Columns.Column width="6%"/>
                <Columns.Column width="15%">
                    {secondColDisplayLabel && <Label>{secondColLabel}</Label>}
                </Columns.Column>
                <Columns.Column width="32%">
                    { secondColumnProps && !secondColText && secondColComponent &&
                        <Form.Field
                            name={secondColName}
                            label={secondColLabel}
                            component={secondColComponent}
                            {...secondColRest}
                        />
                    }
                    { secondColumnProps && secondColText &&
                        <span>{secondColText}</span>
                    }
                </Columns.Column>
        </Columns>
    );
}

TwoColumnRow.propTypes = {
    firstColumnProps: PropTypes.shape({name: PropTypes.string, label: PropTypes.string, component: PropTypes.func, text: PropTypes.string}),
    secondColumnProps: PropTypes.shape({name: PropTypes.string, label: PropTypes.string, component: PropTypes.func, text: PropTypes.string}),
}

export default TwoColumnRow;
