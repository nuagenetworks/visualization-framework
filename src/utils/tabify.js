/*
  This utility will convert the nested data structure
  returned from an ElasticSearch query into a tabular
  data structure represented as an array of row objects.

  Inspired by Kibana's implementation, found at
  https://github.com/elastic/kibana/blob/master/src/ui/public/agg_response/tabify/tabify.js
*/
export default function tabify(response){
    return collectBucket(response.aggregations);
}

function collectBucket(node){
    const keys = Object.keys(node);

    // Use old school `for` so we can break control flow by returning.
    for(let i = 0; i < keys.length; i++){
        const key = keys[i];
        const value = node[key];
        if(typeof value === 'object'){
            if(Array.isArray(value)){
                return extractRows(value);
            }
            return collectBucket(value);
        }
    }
}

function extractRows(buckets){
    return buckets.map((bucket) => {
        return Object.keys(bucket).reduce(function (row, key){
            let value = bucket[key];

            if(typeof value === "object"){
                value = value.value;
            }

            row[key] = value;
            return row;
        }, {});
    });
}
