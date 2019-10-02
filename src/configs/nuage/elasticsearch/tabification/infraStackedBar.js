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

export default function infraPieGraph(response, query = {}) {
    let table;

    if (response.aggregations) {
        const tree = collectBucket(response.aggregations);
        table = flatten(tree);
    } else if (response.hits) {
        table = response.hits.hits.map((d) => d._source);

    } else if (Array.isArray(response)) {
        table = response;

    } else {
        throw new Error("Tabify() invoked with invalid result set. Result set must have either 'aggregations' or 'hits' defined.");
    }

    table = flatArray(table);
    table = processSimpleText(table);

    if (process.env.NODE_ENV === "development") {
        console.log("Results from tabify (first 3 rows only):");

        // This one shows where there are "undefined" values.
        console.log(table)

        // This one shows the full structure pretty-printed.
        console.log(JSON.stringify(table.slice(0, 3), null, 2))
    }

    return table;
}

function processSimpleText(data) {
    let total, failed, passed;
    let output = [];
    let item;
    for (let i = 0; i < data.length; i++) {
        item = data[i];
        total = parseInt(item.total_jobs);
        failed = parseInt(item.failed_jobs);
        passed = total - failed;
        output.push({
            testbed: item.testbed,
            class: "Infra Issues",
            count: failed
        })
        output.push({
            testbed: item.testbed,
            class: "Regression Ran",
            count: passed
        })
    }
    return output
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
    for (let i = 0; i < keys.length; i++) {
        if (Array.isArray(data[keys[i]])) {
            data[keys[i]].forEach(item => {
                final.push({
                    ...data,
                    [keys[i]]: item
                })
            });
            arrayExists = true;
            break;
        } else if (data[keys[i]] && typeof data[keys[i]] === 'object') {

            let products = cartesianProduct(data[keys[i]]);
            if (products.length > 1) {
                products.forEach(item => {
                    final.push({
                        ...data,
                        [keys[i]]: item
                    })
                });
                arrayExists = true;
                break;
            } else if (products.length === 1) {
                data[keys[i]] = products[0];
            }
        }
    };

    if (arrayExists) {
        final = flatArray(final);
    } else {
        final.push(data);
    }

    return final;
}

function collectBucket(node, stack = []) {
    if (!node)
        return;

    const keys = Object.keys(node);

    // Use old school `for` so we can break control flow by returning.
    for (let i = 0; i < keys.length; i++) {
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
            if (key === "buckets" && Object.keys(value).length > 1) {
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

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = buckets[key];

        let currentObject = collectBucket({
            [key]: value
        });

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
                if ("value" in value) {
                    value = value.value;
                } else {
                    value = collectBucket(value, [...stack, key]);
                }
            }

            if (key === "key") {
                key = stack[stack.length - 2]
            }

            if (typeof value === 'object') {
                if ("value" in value) {
                    value = value.value;
                }
            }

            tree[key] = value;

            return tree;
        }, {});
    });
}

function flatten(tree, parentNode = {}) {

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

                        if (value.length) {
                            return value;
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
                    if (childTree.length === 0) {
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