import parse from "json-templates";

/*
    Parameterized a configuration according to the given context
    Arguments:
    * configuration: the configuration template that needs to be parameterized
    * context: the context object that contains parameters
    Returns:
    A parameterized configuration.
*/
export const parameterizedConfiguration = (configuration, context) => {
    const template       = parse(configuration),
          pConfiguration = template(context);

    return pConfiguration;
}
