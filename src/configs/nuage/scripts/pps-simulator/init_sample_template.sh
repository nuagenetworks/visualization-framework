#!/bin/sh
curl -XPUT 'http://localhost:9200/_template/sample_generic_template' -d '
{
    "order" : 0,
    "template" : "sample_index_*",
    "settings" : { },
    "mappings" : {
      "nuage_doc_type" : {
        "dynamic_templates" : [ {
          "strings" : {
            "mapping" : {
              "index" : "not_analyzed",
              "type" : "string"
            },
            "match_mapping_type" : "string"
          }
        }, {
          "timestamps" : {
            "mapping" : {
              "type" : "date"
            },
            "match" : "timestamp"
          }
        } ]
      }
    },
    "aliases" : { }
}
'
curl -XPUT 'http://localhost:9200/_template/sample_index_alias_template' -d '
{
    "order" : 0,
    "template" : "sample_index_*",
    "settings" : { },
    "mappings" : { },
    "aliases" : {
      "sample_index" : { }
    }
}
'