#!/bin/sh
curl -XPUT 'http://localhost:9200/_template/nuage_flow_test_template' -d '
{
  "order": 0,
  "template": "nuage_flow_test*",
  "settings": {},
  "mappings": {
    "nuage_doc_type": {
      "dynamic_templates": [
        {
          "nested": {
            "mapping": {
              "type": "nested"
            },
            "match": "*-pgmem-info"
          }
        },
        {
          "strings": {
            "mapping": {
              "index": "not_analyzed",
              "type": "string"
            },
            "match_mapping_type": "string"
          }
        },
        {
          "timestamps": {
            "mapping": {
              "type": "date"
            },
            "match": "timestamp"
          }
        }
      ]
    }
  },
  "aliases": {}
}
'
curl -XPUT 'http://localhost:9200/_template/nuage_flow_test_alias_template' -d '
{
    "order" : 0,
    "template" : "nuage_flow_test*",
    "settings" : { },
    "mappings" : { },
    "aliases" : {
      "sample_index" : { }
    }
}
'
