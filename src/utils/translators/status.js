const options = {
  '0': 'Good',
  '1': 'Needs Checking',
  '2': 'Critical',
  '3': 'Stopped Functioning'
}

export default (value) => {
  
  if(!options[value]) {
    console.info('Value not found: ', value)
  }

  return options[value] ? options[value] : value
}
