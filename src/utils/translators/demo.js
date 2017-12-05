const options = {
    '1': 'One',
    '2': 'Two'
}

export default (value) => {
    
    if(!options[value]) {
        console.info('Value not found: ', value)
    }

    return options[value] ? options[value] : value
}