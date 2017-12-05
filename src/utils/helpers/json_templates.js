/**
 * JSON Template parser for subsitution of parameters
 */

let parse

const type = (value) => {
  return (
    Array.isArray(value) ? "array" :
    value instanceof Date ? "date" :
    typeof value
  )
}


// Constructs a parameter object from a match result.
// e.g. "['{{foo}}']" --> { key: "foo" }
// e.g. "['{{foo:bar}}']" --> { key: "foo", defaultValue: "bar" }
const Parameter = (match) => {
    match = match.substr(2, match.length - 4).trim()
    let i = match.indexOf(":")
    if(i !== -1){
        let parameter = {
            key: match.substr(0, i),
        }

        let value = match.substr(i + 1)
        
        if(value.includes('call(')) {
            let re = /(call\(')(.*)('\))/
            parameter.evaluate = value.replace(re, "$2")
        } else {
            parameter.defaultValue = value
        }

        return parameter
    } else {
        return { key: match }
    }
}

// Constructs a template function with `parameters` property.
const Template = (fn, parameters) => {
    fn.parameters = parameters
    return fn
}
  
// Parses leaf nodes of the template object that are strings.
// Also used for parsing keys that contain templates.
const parseString = (() => {

  // This regular expression detects instances of the
  // template parameter syntax such as {{foo}} or {{foo:someDefault}}.
  let regex = /{{(\w|:|\s|-|\.|\)|\(|'|,)+}}/g

  return (str) => {
    if(regex.test(str)){

      let matches = str.match(regex),
          parameters = matches.map(Parameter);
      
      return Template((context) => {
        context = context || {}
        return matches.reduce((str, match, i) => {
          let parameter = parameters[i]

          let value = context[parameter.key] || parameter.defaultValue
          return str.replace(match, value)
        }, str)
      }, parameters)

    } else {
      return Template(() => {
        return str
      }, [])
    }
  }
})()

// Parses non-leaf-nodes in the template object that are objects.
const parseObject = (object) => {

  let children = Object.keys(object).map(function (key){
    return {
      keyTemplate: parseString(key),
      valueTemplate: parse(object[key])
    }
  })

  return Template(function (context){
    return children.reduce(function (newObject, child){
      newObject[child.keyTemplate(context)] = child.valueTemplate(context)
      return newObject
    }, {})
  }, children.reduce(function (parameters, child){
      return parameters.concat(child.valueTemplate.parameters, child.keyTemplate.parameters)
  }, []))

}


// Parses non-leaf-nodes in the template object that are arrays.
const parseArray = (array) => {

  let templates = array.map(parse)

  return Template(function (context){
    return templates.map(function (template){
      return template(context)
    })
  }, templates.reduce(function (parameters, template){
    return parameters.concat(template.parameters)
  }, []))

}


// Parses the given template object.
//
// Returns a function `template(context)` that will "fill in" the template
// with the context object passed to it.
// 
// The returned function has a `parameters` property,
// which is an array of parameter descriptor objects,
// each of which has a `key` property and possibly a `defaultValue` property.
parse = (value) => {
    switch(type(value)) {
        case "string":
        return parseString(value);
        case "object":
        return parseObject(value);
        case "array":
        return parseArray(value);
        default:
        return Template(function (){ return value; }, [])
    }
}

export default parse
