import objectPath from 'object-path';
import evalExpression from 'eval-expression';
import _ from 'lodash';
import { readJsonFile } from "./common";
/*
  This utility will convert the nested data structure
  returned from an ElasticSearch query into a tabular
  data structure represented as an array of row objects.

  Inspired by Kibana's implementation, found at
  https://github.com/elastic/kibana/blob/master/src/ui/public/agg_response/tabify/tabify.js
*/

const weekendCoverage = async (response, query = {}) => {
    let table;
    if (query.tabifyOptions.suiteList.file && query.tabifyOptions.suiteList.suiteAreasFile){
        const all_testsuites = await readJsonFile(query.tabifyOptions.suiteList.file);
        const suite_areas = await readJsonFile(query.tabifyOptions.suiteList.suiteAreasFile)
        table = processESResponse(response, query, all_testsuites,suite_areas);   
    }
    else {
        console.error("Specify weekend regression json file.")
    }
    return table;
}

export default weekendCoverage;

function processESResponse(response, query = {}, all_testsuites = null, suite_areas = null){

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

    // tabify data on the basis of the pre-defined properties in configuration
    if (query.tabifyOptions && query.tabifyOptions.suiteList) {
    
        var build = query.tabifyOptions.suiteList.build;
        var aql_area = query.tabifyOptions.suiteList.aql_area;
        let area_filtered_suites;
        let bool_all_areas = false;
        var return_type = "run_count";
        if (query.tabifyOptions.suiteList.coverageType){
            return_type = query.tabifyOptions.suiteList.coverageType;//either of "run_count" or "missed_list"
        }
        
        
        if (aql_area && aql_area != "*"){
            area_filtered_suites = suite_areas[aql_area];
        }
        else{
            bool_all_areas = true;
        }

        all_testsuites = all_testsuites[build].testsuites;
        if (!bool_all_areas){
            let set_area_filtered_suites = new Set(Array.from(area_filtered_suites));
            let filtered_all_testsuites = [...all_testsuites].filter(x => set_area_filtered_suites.has(x))
            all_testsuites = filtered_all_testsuites;
        }
        table = processCoverage(table, all_testsuites,return_type)
    }
    else {
        console.error("Please specify testsuite source for evaluating counts");
    }
    
    if (process.env.NODE_ENV === "development") {
        console.log("Results from tabify (first 3 rows only):");

        // This one shows where there are "undefined" values.
        console.log(table)

        // This one shows the full structure pretty-printed.
        console.log(JSON.stringify(table.slice(0, 3), null, 2))
    }

    return table;
}

function processCoverage(data, all_suites, return_type){
    var result_codes = {"FAIL":1,"SKIP":0,"PASS":2};
    let suitesRun = {};
    let allSuites = new Set(Array.from(all_suites));

    data.forEach((item) => {
        if (allSuites.has(item.testsuites)){
            if (!suitesRun[item.testsuites]){
                suitesRun[item.testsuites] = [];
            }
            suitesRun[item.testsuites].push(item.results);
        }
    });
    
    const output = [];
    
    function hasSuitePassed(element, index, array){
        return element == result_codes.PASS;
    }
    function hasSuiteFailed(element,index,array){
        return element == result_codes.FAIL;
    }
    var skippedSuites = [];
    var failedSuites = [];
    let pass =0,fail=0,skip=0;
    for (var item in suitesRun) {
        if (suitesRun[item].some(hasSuitePassed)){
            pass+=1;
        }
        else if (suitesRun[item].some(hasSuiteFailed)){
            fail+=1;
            failedSuites.push(item);
        }
        else {
            skip +=1;
            skippedSuites.push(item);
        }
    }
    var suitesRunSet = new Set(Array.from(Object.keys(suitesRun)));
    const missedSuites = all_suites.filter(x => !suitesRunSet.has(x));

    if (return_type == "run_count"){
        output.push({
            "result":"PASS",
            "value":pass
        });
        output.push({
            "result":"FAIL",
            "value":fail
        });
        output.push({
            "result":"SKIP",
            "value":skip
        });
        output.push({
            "result":"NOT_RUN",
            "value":missedSuites.length
        });
    }
    else {
        failedSuites.forEach(suite => {
                output.push(
                    {"testsuite":suite,
                    "outcome":"Failed"}
                )
            })
        skippedSuites.forEach(suite => {
            output.push(
                {"testsuite":suite,
                "outcome":"Skipped"}
            )
        })
        missedSuites.forEach(suite => {
            output.push(
                {"testsuite":suite,
                "outcome":"Did Not Run"}
            )
        })
    }
    return output;
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
                final.push({ ...data, [keys[i]]: item })
            });
            arrayExists = true;
            break;
        } else if (data[keys[i]] && typeof data[keys[i]] === 'object') {

            let products = cartesianProduct(data[keys[i]]);
            if (products.length > 1) {
                products.forEach(item => {
                    final.push({ ...data, [keys[i]]: item })
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

        let currentObject = collectBucket({ [key]: value });

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
