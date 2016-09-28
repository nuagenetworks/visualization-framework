/*
    Transforms a splat of parameters to a context
    Arguments:
    * splat: a string that like /a/b/c/d
    Returns:
    a map that can be used as a context
    >> {
        a: b,
        c: d
    }
*/
export const splatToContext = (splat) => {
    if (!splat)
        return {};

    let parameters = splat.split("/").filter(Boolean);

    if (parameters.length % 2 !== 0)
        return {};

    let index = 0, context = {};

    for (index; index < parameters.length - 1; index += 2) {
        context[parameters[index]] = parameters[index + 1];
    }

    return context;
}
