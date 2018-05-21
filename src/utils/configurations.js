import parse from "../utils/helpers/jsonTemplates"
import translator from "../utils/translators"

/**
   This will update the context by calling the respective translator
   Arguments:
    * parameters: parameters of the query that have been parsed.
    * context: the context object that contains parameters value
    Returns:
        context: updated context by calling respective translators
 */
const evaluateContext = (context, parameters) => {
    let updatedContext = Object.assign({}, context)
    for (let i in parameters) {

        if (!parameters.hasOwnProperty(i))
            continue

        let parameter = parameters[i]
        if(parameter.evaluate) {
            updatedContext[parameter.key] = translator(parameter.evaluate, context[parameter.key])
        }
    }
    return updatedContext
}

/*
    Check if the context can parameterized all parameters.
    Arguments:
    * parameters: parameters of the query that have been parsed.
    * context: the context object that contains parameters value
    Returns:
        True if the context matches all parameters
*/
const shouldParameterizedContext = (parameters, context) => {
    return parameters.every((parameter) => {
        return "defaultValue" in parameter || parameter.key in context
    })
}

/*
    Parameterized a configuration according to the given context
    Arguments:
    * configuration: the configuration template that needs to be parameterized
    * context: the context object that contains parameters
    Returns:
    A parameterized configuration.
*/
export const parameterizedConfiguration = (configuration, context) => {
    if (!configuration)
        return false

    const template       = parse(configuration),
          isContextOK    = shouldParameterizedContext(template.parameters, context)

    if(isContextOK)
        return template(evaluateContext(context, template.parameters))

    return false
}

/*
    Returns a key-value dictionary with all parameters that are really used
    in the configuration.
    Arguments:
    * configuration: the configuration template that needs to be parameterized
    * context: the context object that contains parameters
    Returns:
    An object that gives all parameters
*/
export const getUsedParameters = (configuration, context) => {
    const parameters = parse(configuration).parameters;
    let queryParams = {}

    for (let i in parameters) {

        if (!parameters.hasOwnProperty(i))
            continue
            
        let parameter = parameters[i]

        if (parameter.key in context) {
            queryParams[parameter.key] = context[parameter.key]
        }
        else if ("defaultValue" in parameter) {
            queryParams[parameter.key] = parameter.defaultValue
        }
        // else ignore the parameter because it is not used in the provided configuration.
    }

    return queryParams
}

export const contextualize = (data, context) => {
    const template = parse(data)
    return template(evaluateContext(context, template.parameters))
}

