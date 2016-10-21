/*
  This utility will convert the nested data structure
  returned from an ElasticSearch query into a tabular
  data structure represented as an array of row objects.

  Inspired by Kibana's implementation, found at
  https://github.com/elastic/kibana/blob/master/src/ui/public/agg_response/tabify/tabify.js
*/
export default function tabify(response) {
    const table = flatten(collectBucket(response.aggregations));

    console.log("Results from tabify():");

    // This one shows where there are "undefined" values.
    console.log(table)

    // This one shows the full structure pretty-printed.
    console.log(JSON.stringify(table, null, 2))

    return table;
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
            if (Array.isArray(value)) {
                return extractTree(value, [...stack, key]);
            }
            return collectBucket(value, [...stack, key]);
        }
    }
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

            tree[key] = value;

            return tree;
        }, {});
    });
}

function flatten(tree, parentNode={}){
    return tree
        .map((childNode) => Object.assign({}, parentNode, childNode))
        .map((node) => {
            const childTrees = Object.keys(node)
                .map((key) => {
                    const value = node[key];
                    if (Array.isArray(value)) {
                        return value;
                    }
                })
                .filter((d) => d);

            switch (childTrees.length) {
                case 0: // Leaf node case
                    return [node];
                case 1: // Non-leaf node case
                    const childTree = childTrees[0];
                    return flatten(childTree, node);
                default:
                    throw new Error("This case should never happen");
            }
        });
}
