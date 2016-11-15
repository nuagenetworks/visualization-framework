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
                                                    "doc_count": 0
                                                }
                                            }
                                        }
                                    },
                                    "Last 24": {
                                        "doc_count": 0,
                                        "types": {
                                            "buckets": {
                                                "type": {
                                                    "doc_count": 0
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
            { "timezones": "Prev 24", "doc_count": 0 },
            { "timezones": "Last 24", "doc_count": 0 }
        ]

        expect(tabify(response)).toEqual(expectedResults);
    });

});
