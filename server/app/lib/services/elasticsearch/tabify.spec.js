import tabify from './tabify';


describe('ElasticSearch', () => {
    it('should tabify list of objects', () => {
        const response = {
            "took": 8,
            "timed_out": false,
            "_shards": {
                "total": 5,
                "successful": 5,
                "failed": 0
            },
            "hits": {
                "total": 144000,
                "max_score": 0,
                "hits": []
            },
            "aggregations": {
                "2": {
                    "buckets": {
                        "Enterprise": {
                            "4": {
                                "buckets": {
                                    "ACLDENY": {
                                        "doc_count": 51840,
                                        "timestamp": {
                                            "buckets": [
                                                {
                                                    "key_as_string": "2016-10-19T22:00:00.000Z",
                                                    "key": 1476914400000,
                                                    "doc_count": 1620,
                                                    "SumOf": {
                                                        "value": 1223694
                                                    }
                                                },
                                                {
                                                    "key_as_string": "2016-10-19T23:00:00.000Z",
                                                    "key": 1476918000000,
                                                    "doc_count": 2160,
                                                    "SumOf": {
                                                        "value": 1621468
                                                    }
                                                },
                                                {
                                                    "key_as_string": "2016-10-20T00:00:00.000Z",
                                                    "key": 1476921600000,
                                                    "doc_count": 2160,
                                                    "SumOf": {
                                                        "value": 1609771
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            "doc_count": 144000
                        }
                    }
                }
            }
        }

        const expectedResults = [
            {
                "key_as_string": "2016-10-19T22:00:00.000Z",
                "timestamp": 1476914400000,
                "doc_count": 1620,
                "SumOf": 1223694
            },
            {
                "key_as_string": "2016-10-19T23:00:00.000Z",
                "timestamp": 1476918000000,
                "doc_count": 2160,
                "SumOf": 1621468
            },
            {
                "key_as_string": "2016-10-20T00:00:00.000Z",
                "timestamp": 1476921600000,
                "doc_count": 2160,
                "SumOf": 1609771
            }
        ]

        expect(tabify(response)).toEqual(expectedResults);
    });


    it('should tabify list of single object', () => {
        const response =   {
            "took": 6,
            "timed_out": false,
            "_shards": {
                "total": 5,
                "successful": 5,
                "failed": 0
            },
            "hits": {
                "total": 144000,
                "max_score": 0,
                "hits": []
            },
            "aggregations": {
                "2": {
                    "buckets": {
                        "Enterprise": {
                            "4": {
                                "buckets": {
                                    "ACLDENY": {
                                        "doc_count": 51840,
                                        "domains": {
                                            "doc_count_error_upper_bound": 0,
                                            "sum_other_doc_count": 0,
                                            "buckets": [
                                                {
                                                    "key": "chord_domain",
                                                    "doc_count": 51840,
                                                    "SumOf": {
                                                        "value": 38920591
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            "doc_count": 144000
                        }
                    }
                }
            }
        }

        const expectedResults = [
            {
                "domains": "chord_domain",
                "doc_count": 51840,
                "SumOf": 38920591
            }
        ]

        expect(tabify(response)).toEqual(expectedResults);
    });

    it('should tabify a weird thing', () => {
        const response =   {
            "took": 12,
            "timed_out": false,
            "_shards": {
                "total": 5,
                "successful": 5,
                "failed": 0
            },
            "hits": {
                "total": 144000,
                "max_score": 0,
                "hits": []
            },
            "aggregations": {
                "2": {
                    "buckets": {
                        "Enterprise": {
                            "doc_count": 144000,
                            "SumOf": {
                                "value": 2158541661
                            },
                            "EventType": {
                                "doc_count_error_upper_bound": 0,
                                "sum_other_doc_count": 0,
                                "buckets": [
                                    {
                                        "key": "TCA_EVENT",
                                        "doc_count": 59040,
                                        "SumOf": {
                                            "value": 884851403
                                        }
                                    },
                                    {
                                        "key": "ACL_DENY",
                                        "doc_count": 47520,
                                        "SumOf": {
                                            "value": 712882070
                                        }
                                    },
                                    {
                                        "key": "TCP_SYN_FLOOD",
                                        "doc_count": 37440,
                                        "SumOf": {
                                            "value": 560808188
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }

        const expectedResults = [
            {"value": 2158541661}
        ]

        expect(tabify(response)).toEqual(expectedResults);
    });

    it('should tabify an empty list', () => {
        const response = {
            "took": 14,
            "timed_out": false,
            "_shards": {
                "total": 15,
                "successful": 15,
                "failed": 0
            },
            "hits": {
                "total": 669887,
                "max_score": 0,
                "hits": []
            },
            "aggregations": {
                "1": {
                    "buckets": {
                        "Enterprise": {
                            "doc_count": 669887,
                            "slastatus": {
                                "doc_count_error_upper_bound": 0,
                                "sum_other_doc_count": 0,
                                "buckets": []
                            }
                        }
                    }
                }
            }
        }

        const expectedResults = []

        expect(tabify(response)).toEqual(expectedResults);
    });

    it('should tabify an object', () => {
        const response =   {
            "took": 4,
            "timed_out": false,
            "_shards": {
                "total": 5,
                "successful": 5,
                "failed": 0
            },
            "hits": {
                "total": 144000,
                "max_score": 0,
                "hits": []
            },
            "aggregations": {
                "2": {
                    "buckets": {
                        "Domain": {
                            "doc_count": 144000,
                            "timezones": {
                                "buckets": {
                                    "Prev 24": {
                                        "doc_count": 0,
                                        "types": {
                                            "buckets": {
                                                "type": {
                                                    "doc_count": 10
                                                }
                                            }
                                        }
                                    },
                                    "Last 24": {
                                        "doc_count": 0,
                                        "types": {
                                            "buckets": {
                                                "type": {
                                                    "doc_count": 20
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        const expectedResults = [
            { "timezones": "Prev 24", "doc_count": 10 },
            { "timezones": "Last 24", "doc_count": 20 }
        ]

        expect(tabify(response)).toEqual(expectedResults);
    });

    it('should tabify hits within aggregation', () => {
        const response = {
          "took": 13628,
          "timed_out": false,
          "_shards": {
            "total": 5,
            "successful": 5,
            "failed": 0
          },
          "hits": {
            "total": 10080000,
            "max_score": 0,
            "hits": []
          },
          "aggregations": {
            "2": {
              "buckets": {
                "Enterprise": {
                  "3": {
                    "buckets": {
                      "Domain": {
                        "doc_count": 2880000,
                        "top-acls": {
                          "doc_count_error_upper_bound": 4557,
                          "sum_other_doc_count": 1404000,
                          "buckets": [
                            {
                              "key": "55cd911d-aa9b-4647-b4dc-68a63122aa7c",
                              "doc_count": 10080,
                              "top-acl-hits": {
                                "hits": {
                                  "total": 10080,
                                  "max_score": null,
                                  "hits": [
                                    {
                                      "_index": "nuage_flow",
                                      "_type": "nuage_doc_type",
                                      "_id": "AVeZZov_c3SvEs9LIN_2",
                                      "_score": null,
                                      "_source": {
                                        "destinationport": 3,
                                        "sourceport": 5,
                                        "protocol": "TCP",
                                        "nuage_metadata": {
                                          "dpgName": "PG15",
                                          "spgName": "PG9"
                                        }
                                      },
                                      "sort": [
                                        1000
                                      ]
                                    }
                                  ]
                                }
                              }
                            },
                            {
                              "key": "ba6ee261-3aa1-439f-be90-102136300472",
                              "doc_count": 7200,
                              "top-acl-hits": {
                                "hits": {
                                  "total": 7200,
                                  "max_score": null,
                                  "hits": [
                                    {
                                      "_index": "nuage_flow",
                                      "_type": "nuage_doc_type",
                                      "_id": "AVeZZfnvc3SvEs9LIA9v",
                                      "_score": null,
                                      "_source": {
                                        "destinationport": 1,
                                        "sourceport": 4,
                                        "protocol": "UDP",
                                        "nuage_metadata": {
                                          "dpgName": "PG15",
                                          "spgName": "PG18"
                                        }
                                      },
                                      "sort": [
                                        1000
                                      ]
                                    }
                                  ]
                                }
                              }
                            },
                            {
                              "key": "fd4ba772-608c-4ea2-84cc-701214385856",
                              "doc_count": 7200,
                              "top-acl-hits": {
                                "hits": {
                                  "total": 7200,
                                  "max_score": null,
                                  "hits": [
                                    {
                                      "_index": "nuage_flow",
                                      "_type": "nuage_doc_type",
                                      "_id": "AVeZXy8tc3SvEs9LFwT9",
                                      "_score": null,
                                      "_source": {
                                        "destinationport": 3,
                                        "sourceport": 3,
                                        "protocol": "TCP",
                                        "nuage_metadata": {
                                          "dpgName": "PG8",
                                          "spgName": "PG9"
                                        }
                                      },
                                      "sort": [
                                        1000
                                      ]
                                    }
                                  ]
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  "doc_count": 10080000
                }
              }
            }
          }
        };

        const expectedResults = [
          {
            "top-acls": "55cd911d-aa9b-4647-b4dc-68a63122aa7c",
            "doc_count": 10080,
            "top-acl-hits": {
              "destinationport": 3,
              "sourceport": 5,
              "protocol": "TCP",
              "sort": 1000,
              "nuage_metadata": {
                "dpgName": "PG15",
                "spgName": "PG9"
              }
            }
          },
          {
            "top-acls": "ba6ee261-3aa1-439f-be90-102136300472",
            "doc_count": 7200,
            "top-acl-hits": {
              "destinationport": 1,
              "sourceport": 4,
              "protocol": "UDP",
              "sort": 1000,
              "nuage_metadata": {
                "dpgName": "PG15",
                "spgName": "PG18"
              }
            }
          },
          {
            "top-acls": "fd4ba772-608c-4ea2-84cc-701214385856",
            "doc_count": 7200,
            "top-acl-hits": {
              "destinationport": 3,
              "sourceport": 3,
              "protocol": "TCP",
              "sort": 1000,
              "nuage_metadata": {
                "dpgName": "PG8",
                "spgName": "PG9"
              }
            }
          }
        ];

        expect(tabify(response)).toEqual(expectedResults);
    });

});
