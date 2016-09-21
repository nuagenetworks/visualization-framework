import { computeQuery } from "./redux/actions"

describe('ComputeQuery', () => {

    it('should returns configuration when no context is provided', () => {
        let id            = "anID",
            configuration = {},
            query         = computeQuery(id, configuration);

        expect(query).toBe(configuration);
    });

    it('should returns configuration if no aggs is provided', () => {
        let id            = "anID",
            configuration = {},
            context       = {},
            query         = computeQuery(id, configuration, context);

        expect(query).toBe(configuration);
    });

    it('should returns configuration if aggs has no child', () => {
        let id            = "anID",
            configuration = {aggs: {}},
            context       = {},
            query         = computeQuery(id, configuration, context);

        expect(query).toBe(configuration);
    });

    it('should returns configuration if aggs has no filters', () => {
        let id            = "anID",
            configuration = {aggs: {3: {}}},
            context       = {},
            query         = computeQuery(id, configuration, context);

        expect(query).toBe(configuration);
    });

    it('should returns configuration if aggs has no filters.filters', () => {
        let id            = "anID",
            configuration = {aggs: {3: {filters: {}}}},
            context       = {},
            query         = computeQuery(id, configuration, context);

        expect(query).toBe(configuration);
    });

    it('should returns configuration if no context matches', () => {
        let id            = "anID",
            configuration = {
                aggs: {
                    3: {
                        filters: {
                            filters: {
                                MyCompany: {
                                    query: {
                                        term: {
                                            unknownParams: ""
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            context       = {enterpriseName: "my-testing-company"},
            query         = computeQuery(id, configuration, context);

        expect(query).toBe(configuration);
    });

    it('should returns a parameterized query if context matches', () => {
        let id            = "anID",
            configuration = {
                aggs: {
                    3: {
                        filters: {
                            filters: {
                                MyCompany: {
                                    query: {
                                        term: {
                                            enterpriseName: "hello world"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            context       = {enterpriseName: "my-testing-company"},
            query         = computeQuery(id, configuration, context);

        expect(query.aggs["3"].filters.filters.MyCompany.query.term).toEqual(context);
    });

    it('should returns a protected query if context matches', () => {
        let id            = "anID",
            configuration = {
                aggs: {
                    3: {
                        filters: {
                            filters: {
                                MyCompany: {
                                    query: {
                                        term: {
                                            enterpriseName: "hello world"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            context       = {enterpriseName: "my testing company"},
            query         = computeQuery(id, configuration, context);

        expect(query.aggs["3"].filters.filters.MyCompany.query.term).toEqual({enterpriseName: "my%20testing%20company"});
    });


})
