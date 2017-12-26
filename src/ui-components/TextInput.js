import React from 'react';
import inputHOC from './inputHOC';
import Field from './Field';

const TextInput = props => <Field {...props} type="text" />;

export default inputHOC(TextInput);
