/**
 * Add respective translator file and register it inside translatorList object
 */

import demo from './demo'
import time_convert from './time_convert'
import status from './status'

const translatorList = {
  demo,
  time_convert,
  status
}

export default (method, value) => {

  if(!translatorList[method]) {
    console.error(`Translator not found for: ${method}`)
    return value
  }

  return translatorList[method](value)
}