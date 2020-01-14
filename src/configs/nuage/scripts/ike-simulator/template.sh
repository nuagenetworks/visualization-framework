#!/bin/sh
curl -XPUT 'http://localhost:9200/_template/nuage_ike_template' -d '
{
  "order": 0,
  "template": "nuage_ike*",
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
curl -XPUT 'http://localhost:9200/_template/nuage_ike_stats_alias_template' -d '
{
    "order" : 0,
    "template" : "nuage_ike_stats*",
    "settings" : { },
    "mappings" : { },
    "aliases" : {
      "sample_index" : { }
    }
}
'

curl -XPUT 'http://localhost:9200/_template/nuage_ike_probestats_alias_template' -d '
{
    "order" : 0,
    "template" : "nuage_ike_probestats*",
    "settings" : { },
    "mappings" : { },
    "aliases" : {
      "sample_index" : { }
    }
}
'
