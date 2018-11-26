/*
  This utility will convert the nested data structure
  returned from an ElasticSearch query into a tabular
  data structure represented as an array of row objects.

  Inspired by Kibana's implementation, found at
  https://github.com/elastic/kibana/blob/master/src/ui/public/agg_response/tabify/tabify.js
*/
export default function nsgDiskUsage(response) {
    let table;

    if (response.hits.hits.length ==1 && response.hits.hits[0]._source.disks) {
        table = response.hits.hits.map((d) => d._source);
    } else {
        throw new Error("Tabify() invoked with invalid result set. Result set must have either 'aggregations' or 'hits' defined.");
    }
    table = response.hits.hits[0]._source.disks;
    //table = flatArray(table)

    let finalData = [];
    table.forEach(item => {
        //Select only these two disks, and populate their percentages. Little workaround to avoid lots of configuration in configuration file
        if (item.name === "/home" || item.name === "/nuagetmpfs"){
        finalData.push({
          name:item.name,
          field:"used",
          value:(item.used*100/(item.used+item.available))  
        });
        finalData.push({
            name:item.name,
            field:"available",
            value:(item.available*100/(item.used+item.available))  
        });
    }
    })

    if (process.env.NODE_ENV === "development") {
        console.log("Results from tabify (first 3 rows only):");

        // This one shows where there are "undefined" values.
        console.log(finalData)

        // This one shows the full structure pretty-printed.
        console.log(JSON.stringify(finalData.slice(0, 3), null, 2))
    }

    return finalData;
}
