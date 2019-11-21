import objectPath from 'object-path';
import evalExpression from 'eval-expression';
import _ from 'lodash';
/*
  This utility will convert the nested data structure
  returned from an ElasticSearch query into a tabular
  data structure represented as an array of row objects.

  Inspired by Kibana's implementation, found at
  https://github.com/elastic/kibana/blob/master/src/ui/public/agg_response/tabify/tabify.js
*/
export default function expressHeatmap(response, query = {}) {
    let table;

    if (response.aggregations) {
        const tree = collectBucket(response.aggregations);
        table = flatten(tree);
    } else if (response.hits) {
        table = response.hits.hits.map((d) => {
            return d._source
        });

    } else if (Array.isArray(response)) {
        table = response;

    } else {
        throw new Error("Tabify() invoked with invalid result set. Result set must have either 'aggregations' or 'hits' defined.");
    }
    
    let express_suites;
    if (query.tabifyOptions.express_suites){
        express_suites = query.tabifyOptions.express_suites;
    }
    
    table = processForHeatmap(table, express_suites);

    table = flatArray(table)

    if (process.env.NODE_ENV === "development") {
        console.log("Results from tabify (first 3 rows only):");

        // This one shows where there are "undefined" values.
        console.log(table)

        // This one shows the full structure pretty-printed.
        console.log(JSON.stringify(table.slice(0, 3), null, 2))
    }

    return table;
}

function processForHeatmap(table, suites){
    let result_codes = {
        "1":"FAIL",
        "0":"SKIP",
        "2":"PASS"
    }
    let item;
    let suites_in_response = new Set();
    for (let i=0; i<table.length; i++){
        item = table[i];
        if (typeof item.testsuite == 'string') {
            item.result = result_codes[item.result];
            suites_in_response.add(item.testsuite);
        }
    }
    let suites_left = suites.filter((suite) => { return !suites_in_response.has(suite);});
    let last_time = table[0].date_histo;
    for (let i = 0;i<suites_left.length;i++){
        item = {
            "testsuite": suites_left[i],
            "result": "Empty",
            "date_histo":last_time
          };
          table.push(item);
    }
    return table;
}

function findPropertyPath(obj, name) {
    for (var prop in obj) {
        if (prop === name) {
            return name;
        } else if (typeof obj[prop] === "object") {
            var result = findPropertyPath(obj[prop], name);
            if (result) { return prop + '.' + result; }
        }
    }

    return null;
}

function flatArray(data) {

  let finalData = [];
  data.forEach(item => {
      let result = cartesianProduct(item);
      finalData = [...finalData, ...result];
  })

  return finalData;
}


function cartesianProduct(data) {
    let final = [];
    let arrayExists = false;

    let keys = Object.keys(data);
    for(let i = 0; i < keys.length; i++) {
        if(Array.isArray(data[keys[i]])) {
            if (data[keys[i]].length === 0) {
                data[keys[i]].push({});
            }

            data[keys[i]].forEach(item => {
                final.push({...data, [keys[i]]: item})
            });
            arrayExists = true;
            break;
        } else if (data[keys[i]] && typeof data[keys[i]] === 'object') {

            let products = cartesianProduct(data[keys[i]]);
            if(products.length > 1) {
                products.forEach(item => {
                    final.push({...data, [keys[i]]: item})
                });
                arrayExists = true;
                break;
            } else if (products.length === 1) {
                data[keys[i]] = products[0];
            }
        }
    };

    if(arrayExists) {
        final = flatArray(final);
    } else {
        final.push(data);
    }

    return final;
}

function collectBucket(node, stack=[]) {
    if (!node)
        return;

    const keys = Object.keys(node);

    // Use old school `for` so we can break control flow by returning.
    for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = node[key];

        if (typeof value === 'object') {

            if ("hits" in value && Array.isArray(value.hits) && value.hits.length === 1) {
                if ("sort" in value.hits[0]) {
                    value.hits[0]._source['sort'] = value.hits[0].sort[0];
                }
                return value.hits[0]._source;
            }

            if (Array.isArray(value)) {
                return extractTree(value, [...stack, key]);
            }

            // Here we are sure to have an object
            if (key === "buckets" && Object.keys(value).length > 1)
            {
                return extractBuckets(value, [...stack, key]);
            }
            return collectBucket(value, [...stack, key]);
        }
    }

    return node;
}

function extractBuckets(buckets, stack) {
    const keys = Object.keys(buckets);
    let results = [];

    for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = buckets[key];

        let currentObject = collectBucket({[key]: value});

        if (!currentObject)
            continue;

        currentObject[stack[stack.length - 2]] = key;
        results.push(currentObject)
    }

    return results;
}

function extractTree(buckets, stack) {
    return buckets.map((bucket) => {
        return Object.keys(bucket).reduce(function (tree, key) {
            let value = bucket[key];

            if (typeof value === "object") {
                if("value" in value){
                    value = value.value;
                } else {
                    value = collectBucket(value, [...stack, key]);
                }
            }

            if(key === "key"){
                key = stack[stack.length - 2]
            }

            if (typeof value === 'object') {
                if("value" in value){
                    value = value.value;
                }
            }

            tree[key] = value;

            return tree;
        }, {});
    });
}

function flatten(tree, parentNode={}){

    if (!tree)
        return [];

    if (!Array.isArray(tree))
        tree = [tree];

    return tree

        // Have the child node inherit values from the parent.
        .map((childNode) => Object.assign({}, parentNode, childNode))

        // Each node object here has values inherited from its parent.
        .map((node) => {

            // Detect properties whose values are arrays.
            const childTrees = Object.keys(node)
                .map((key) => {
                    const value = node[key];
                    if (Array.isArray(value)) {

                        if(value.length) {
                            return value.map(item => {
                                if (item[key]) {
                                    return item;
                                }

                                return {[key]: item};
                            });
                        }

                        node[key] = null;
                    }
                    return false;
                })
                .filter((d) => d);
            switch (childTrees.length) {

                // Leaf node case, return the node.
                case 0:
                    return node;

                // Non-leaf node case, recurse on the child nodes.
                default:
                    const childTree = childTrees[0];
                    if(childTree.length === 0){
                        return node;
                    }
                    return flatten(childTree, node);
                // default:
                //     throw new Error("This case should never happen");
            }
        })

        // Flatten the nested arrays.
        .reduce((a, b) => a.concat(b), []);
}
