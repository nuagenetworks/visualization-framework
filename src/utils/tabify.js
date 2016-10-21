/*
  This utility will convert the nested data structure
  returned from an ElasticSearch query into a tabular
  data structure represented as an array of row objects.

  Inspired by Kibana's implementation, found at
  https://github.com/elastic/kibana/blob/master/src/ui/public/agg_response/tabify/tabify.js
*/
export default function tabify(response) {
    const table = collectBucket(response.aggregations);

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
                return extractRows(value, [...stack, key]);
            }
            return collectBucket(value, [...stack, key]);
        }
    }
}

function extractRows(buckets, stack) {
    return buckets.map((bucket) => {
        return Object.keys(bucket).reduce(function (row, key) {
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

            row[key] = value;

            return row;
        }, {});
    });
}
