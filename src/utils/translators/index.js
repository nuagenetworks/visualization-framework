/**
 * Add respective translator file and register it inside translatorList object
 */

import demo from './demo'

const translatorList = {
    demo
}

export default (method, value) => {

    if(!translatorList[method]) {
        console.error(`Translator not found for: ${method}`)
        return value
    }

    return translatorList[method](value)
}