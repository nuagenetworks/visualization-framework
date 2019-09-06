import { stringify } from "querystring";
import { readJsonFile } from "./common";

/*
  This utility will convert the nested data structure
  returned from an ElasticSearch query into a tabular
  data structure represented as an array of row objects.
*/

const areaHeatmap = async (response, query = {}) => {
    let table;
    if (query.tabifyOptions.suiteAreasFile){
        const suite_areas = await readJsonFile(query.tabifyOptions.suiteAreasFile);
        table = tabify(response, query, suite_areas);   
    }
    else {
        console.error("Specify Suite Areas json file.");
    }
    return table;
}

export default areaHeatmap;

function tabify(response, query = {}, suite_areas = {}) {
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
    let aql_area;
    if (query.tabifyOptions.aql_area){
        aql_area = query.tabifyOptions.aql_area;
    }
    
    const area_filtered_suites = suite_areas[aql_area];
    table = processForHeatmap(table, area_filtered_suites);

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
        item.result = result_codes[item.result];
        suites_in_response.add(item.testsuite);
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

function collectBucket(node, stack=[]) {
    if (!node)
        return;
    
    const keys = Object.keys(node);
    
    // Use old school `for` so we can break control flow by returning.
    for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = node[key];
        if (typeof value === 'object' && value !== null) {
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

        if (key === "value" && typeof value !== "object" && stack.length === 1) {
            let collectedObject = collectBucket({[stack[0]]: value});
            node = collectedObject;
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
                        return value;
                    }
                    return false;
                })
                .filter((d) => d);

            switch (childTrees.length) {

                // Leaf node case, return the node.
                case 0:
                    return node;

                // Non-leaf node case, recurse on the child nodes.
                case 1:
                    const childTree = childTrees[0];
                    if(childTree.length === 0){
                        return node;
                    }
                    return flatten(childTree, node);
                default:
                    throw new Error("This case should never happen");
            }
        })

        // Flatten the nested arrays.
        .reduce((a, b) => a.concat(b), []);
}
