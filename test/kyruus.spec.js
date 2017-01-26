'use strict';

let q = require('q'),
    _ = require('lodash'),
    should = require('should');

describe('Kyruus SDK', () => {
    let Kyruus = null;
    const kyruuuuuus = (promise) => Kyruus._https = (options, body) => typeof promise == 'function' ? promise(options,body) : promise;

    beforeEach(() => {
        Kyruus = new (require('../kyruus-sdk'))('preview-api.kyruus.com', 'test');
    });

    describe('_refreshToken', () => {

        it('should reject if login fails', () => {
            kyruuuuuus(q.reject('Bad Request'));

            return Kyruus._refreshToken().then((result) => {
                console.log(result);
                return q.reject('It logged in');
            }, (err) => {
                return q.resolve(err);
            });
        });

        it('should login successfully', () => {
            kyruuuuuus(q({expires_in: 3600}));
            return Kyruus._refreshToken();
        });
    });

    describe('Kyruus SDK logged in tests', () => {
        beforeEach(() => {
            kyruuuuuus(q({expires_in: 3600}));
            return Kyruus._refreshToken();
        });

        const kyruusSearchObject = {
            suggestions: {
                "name": [{
                    "suggestions": [
                        "jennis",
                        "jennifer"
                    ],
                    "term": "jennif"
                }]
            },
            providers: [
                {
                    value: 'I want this one'
                },
                {
                    value: 'I don\'t want dis one'
                }
            ],
            facets: [1,2,3,4,5],
        },
            kyruusTypeAheadObject = {
                "exact": {
                    "docs": [
                        {
                            "content_type": "name",
                            "value": "Jennifer"
                        },
                        {
                            "content_type": "specialty_synonym",
                            "in_what": "Hematology",
                            "name": "Anemia and Bone Marrow Disorders",
                            "value": "Hematology.Anemia and Bone Marrow Disorders.*"
                        }
                    ],
                    "total": 2
                }
            };

        describe('getDoctorByNpi', function() {

            it('Should return a doctor for a valid npi', () => {
                kyruuuuuus(q(kyruusSearchObject));

                return Kyruus.getDoctorByNpi(1386998102).then(result => {
                    should(result).equal(kyruusSearchObject.providers[0]);
                });
            });
        });

        describe('getAllFacets', function() {
            it('Should return a set of facets', () => {
                kyruuuuuus(q(kyruusSearchObject));

                return Kyruus.getAllFacets().then(result => {
                    should(result).equal(kyruusSearchObject.facets);
                });
            });
        });

        describe('suggest', function() {
            it('Should return some suggestions', () => {
                kyruuuuuus((options) => {
                    return q((options.path.indexOf('typeahead') > -1 ? kyruusTypeAheadObject : kyruusSearchObject));
                });

                let suggester = kyruusSearchObject.suggestions.name[0].term;

                return Kyruus.suggest(suggester).then(result => {
                    should.exist(result.name);
                    should(result.name[0].term).equal(suggester);
                    should.exist(result.specialty_synonym);
                    should(result.specialty_synonym[0].term).equal(suggester);
                    should(result.name[0].suggestions).have.lengthOf(3);
                    should(result.specialty_synonym[0].suggestions).have.lengthOf(1);
                });
            });
        });

        describe('searchByLocation', function() {
            it('Should return some locations', () => {
                kyruuuuuus(q(kyruusSearchObject));

                return Kyruus.searchByLocation(20723, 20).then(result => {
                    should(result).equal(kyruusSearchObject);
                });
            });
        });

        describe('refreshToken', function() {
            it('Should refresh an expired token while requests are being made', () => {
                // Log out from Kyruus
                Kyruus._expiresAt = 0;

                // The delay allows the requests to queue up and all rely on the connection to Kyruus to be made
                kyruuuuuus((options) =>
                    options.path.indexOf('oauth') > -1 ? q({expires_in: 3600}).delay(100) : q(kyruusSearchObject)
                );

                return q.all(_.map([1,2,3,4,5], item => {
                    return Kyruus.getDoctorByNpi(1386998102);
                })).then(results => {
                    for(let result of results) {
                        should.exist(result);
                        should(result).equal(kyruusSearchObject.providers[0]);
                    }
                });
            });
        });
    });
});
