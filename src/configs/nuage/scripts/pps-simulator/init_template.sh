#!/bin/sh
curl -XPUT 'http://localhost:9200/_template/nuage_generic_template' -d '
{
    "order" : 0,
    "template" : "nuage_*",
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
curl -XPUT 'http://localhost:9200/_template/nuage_dpi_flowstats_alias_template' -d '
{
    "order" : 0,
    "template" : "nuage_dpi_flowstats*",
    "settings" : { },
    "mappings" : { },
    "aliases" : {
      "nuage_dpi_flowstats" : { }
    }
}
'
curl -XPUT 'http://localhost:9200/_template/nuage_dpi_probestats_alias_template' -d '
{
    "order" : 0,
    "template" : "nuage_dpi_probestats*",
    "settings" : { },
    "mappings" : { },
    "aliases" : {
      "nuage_dpi_probestats" : { }
    }
}
'
curl -XPUT 'http://localhost:9200/_template/nuage_dpi_slastats_alias_template' -d '
{
    "order" : 0,
    "template" : "nuage_dpi_slastats*",
    "settings" : { },
    "mappings" : { },
    "aliases" : {
      "nuage_dpi_slastats" : { }
    }
}
'
curl -XPUT 'http://localhost:9200/_template/nuage_natt_alias_template' -d '
{
    "order" : 0,
    "template" : "nuage_natt*",
    "settings" : { },
    "mappings" : { },
    "aliases" : {
      "nuage_natt" : { }
    }
}
'