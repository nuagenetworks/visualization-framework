/**
 * Add respective translator file and register it inside translatorList object
 */

import demo from './demo'
import time_convert from './time'
import status from './status'
import epoch_to_date from './epoch_to_date'
import epoch_to_datetime from './epoch_to_datetime'
import epoch_to_short_date from './epoch_to_short_date'


const translatorList = {
  demo,
  time_convert,
  status,
  epoch_to_date,
  epoch_to_datetime,
  epoch_to_short_date
}

export default (method, value) => {

  if(!translatorList[method]) {
    console.error(`Translator not found for: ${method}`)
    return value
  }

  return translatorList[method](value)
}
