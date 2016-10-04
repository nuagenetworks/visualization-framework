import parse from "json-templates";

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
        return "defaultValue" in parameter || parameter.key in context;
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
        return false;

    const template       = parse(configuration),
          isContextOK    = shouldParameterizedContext(template.parameters, context);

    if(isContextOK)
        return template(context);

    return false;
}
