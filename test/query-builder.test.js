'use strict';

let q = require('q'),
    _ = require('lodash'),
    should = require('should');

const k = require('../query-builder'),
      FilterObject = require('../filter-object.js');


describe('Kyruus Query Builder', () => {
    let queryBuilder = null;

    beforeEach(() => {
        queryBuilder = new k();
    });

    describe('Test constructor object', () => {
        it('should have the required starting objects', () => {
            should.exist(queryBuilder);
            should.exist(queryBuilder._filter);
        });
    });
    let filterTestString = 'YqmNuEMKZwb4Ih30Q8h0bAIJ622csxPv0gptSZxnzHVSYkTg5rJxZnx0oGfgpgnFvkWWZcF5FgnhG3rSbUX75fojB6wky7WwpcsEfIlh806YTugkn3xrnTTpjqzmIO'.split('');
    const multiFilterTests = [['npi', 'npis'],
                        ['locations.name', 'locationNames'],
                        ['specialties.specialty.untouched', 'specialties'],
                        ['specialties.subspecialty.untouched', 'subSpecialties'],
                        ['locations.city', 'cityLocations'],
                        ['languages.language', 'languages']];

    const singleFilterTests = [['gender', 'gender'],
                            ['specialties.practice_focus.untouched', 'practiceFocus'],
                            ['accepting_new_patients', 'acceptingNewPatients']];

    const parameterTests = [['shuffle_seed', 'shuffle'],
                            ['sort','sort'],
                            ['per_page', 'pageSize'],
                            ['page', 'pageNumber'],
                            ['facets', 'facets']];

    const vectors = [[k.NAME,'name'],
                    [k.SPECIALTYSYNONYM,'specialtySynonym'],
                    [k.CLINICALEXPERIENCE,'clinicalExperience'],
                    [k.PRACTICEGROUP,'practiceGroup'],
                    [k.UNIFIED,'unified']];

    describe('Test Multi Filters', () => {
        const filterTest = (field, func, val1, val2) => {
            let removeFunc = 'remove' + func.charAt(0).toUpperCase() + func.slice(1);
            describe(`Test ${func} filter`, () => {
                it(`should have function ${func}`, () => {
                    should(queryBuilder).have.property(func);
                });
                it(`should have remove function ${removeFunc}`, () => {
                    should(queryBuilder).have.property(removeFunc);
                });
                it(`should not have ${field} field`, () => {

                    should(queryBuilder._filter).not.have.key(field);
                });
                it(`should have ${field} field`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._filter).have.key(field);
                });
                it(`${field} filter should be FilterObject`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._filter[field]).be.an.instanceOf(FilterObject);
                });
                it(`${field} filter should import single value`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._filter[field].size()).be.equal(1);
                });
                it(`${field} filter should import two values`, () => {
                    queryBuilder[func](val1, val2);
                    should(queryBuilder._filter[field].size()).be.equal(2);
                });
                it(`${field} filter should remove values`, () => {
                    queryBuilder[func](val1, val2);
                    should(queryBuilder._filter[field].size()).be.greaterThan(1);
                    queryBuilder[removeFunc](val1);
                    should(queryBuilder._filter[field].size()).be.equal(1);
                });
                it(`${field} filter should not exist`, () => {
                    queryBuilder[func](val1, val2);
                    should(queryBuilder._filter).have.key(field);
                    queryBuilder[removeFunc](val1, val2);
                    should(queryBuilder._filter).not.have.key(field);
                });
                it(`query should not contain ${field} filter`, () => {
                    should(`${queryBuilder}`.indexOf(`filter=${field}:`)).be.lessThan(0);
                });
                it(`query should contain ${field} filter`, () => {
                    queryBuilder[func](val1);
                    should(`${queryBuilder}`.indexOf(`filter=${field}:`)).be.greaterThan(0);
                });
                it(`should format npi filter pipes`, () => {
                    queryBuilder[func](val1, val2);
                    should(`${queryBuilder}`.indexOf(`filter=${field}:${val1}|${val2}`)).be.greaterThan(0);
                });
            });
        };
        for (let test of multiFilterTests) {
            filterTest(...test, filterTestString.pop(), filterTestString.pop());
        }

    });

    describe('Test Single Filters', () => {
        const filterTest = (field, func, val1, val2) => {
            let removeFunc = 'remove' + func.charAt(0).toUpperCase() + func.slice(1);
            describe(`Test ${func} filter`, () => {
                it(`should have function ${func}`, () => {
                    should(queryBuilder).have.property(func);
                });
                it(`should have remove function ${removeFunc}`, () => {
                    should(queryBuilder).have.property(removeFunc);
                });
                it(`should not have ${field} field`, () => {
                    should(queryBuilder._filter).not.have.key(field);
                });
                it(`should have ${field} field`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._filter).have.key(field);
                });
                it(`${field} filter should be FilterObject`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._filter[field]).be.instanceof(FilterObject);
                });
                it(`${field} filter should import single value`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._filter[field].size()).be.equal(1);
                });
                it(`${field} filter should not exist`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._filter).have.key(field);
                    queryBuilder[removeFunc](val1);
                    should(queryBuilder._filter).not.have.key(field);
                });
                it(`query should not contain ${field} filter`, () => {
                    should(`${queryBuilder}`.indexOf(`filter=${field}:`)).be.lessThan(0);
                });
                it(`query should contain ${field} filter`, () => {
                    queryBuilder[func](val1);
                    should(`${queryBuilder}`.indexOf(`filter=${field}:`)).be.greaterThan(0);
                });
            });
        };
        for (let test of singleFilterTests) {
            filterTest(...test, filterTestString.pop(), filterTestString.pop());
        }

    });
    describe('Test Parameters', () => {
        const filterTest = (field, func, val1, val2) => {
            let removeFunc = 'remove' + func.charAt(0).toUpperCase() + func.slice(1);
            describe(`Test ${func} filter`, () => {
                it(`should have function ${func}`, () => {
                    should(queryBuilder).have.property(func);
                });
                it(`should have remove function ${removeFunc}`, () => {
                    should(queryBuilder).have.property(removeFunc);
                });
                it(`should not have ${field} field`, () => {
                    should(queryBuilder._params).not.have.key(field);
                });
                it(`should have ${field} field`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._params).have.key(field);
                });
                it(`${field} parameter should be overwritten`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._params[field]).be.equal(val1);
                    queryBuilder[func](val2);
                    should(queryBuilder._params[field]).be.equal(val2);
                });
                it(`${field} should not exist after remove`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._params).have.key(field);
                    queryBuilder[removeFunc]();
                    should(queryBuilder._params).not.have.key(field);
                });
                it(`query should not contain ${field} param`, () => {
                    should(`${queryBuilder}`.indexOf(`${field}=${val1}`)).be.lessThan(0);
                });
                it(`query should contain ${field} param`, () => {
                    queryBuilder[func](val1);
                    should(`${queryBuilder}`.indexOf(`${field}=${val1}`)).be.greaterThan(0);
                });
            });
        };
        for (let test of parameterTests) {
            filterTest(...test, filterTestString.pop(), filterTestString.pop());
        }
    });
    describe('Test Filter Construction', () => {
        it(`should be empty`, () => {
            should(`${queryBuilder}`).be.empty;
        });
        it(`should not be empty`, () => {
            queryBuilder.filterOther('a','b');
            should(`${queryBuilder}`).not.be.empty;
        });
        it(`should start with ?`, () => {
            queryBuilder.filterOther('a','b');
            should(`${queryBuilder}`.charAt(0)).be.equal('?');
        });
        it(`should have two param`, () => {
            queryBuilder.filterOther('a','b');
            queryBuilder.param('c','d');
            should(`${queryBuilder}`.match(/=/g)||[]).have.length(2);
        });
        it(`should have three params`, () => {
            queryBuilder.filterOther('a','b');
            queryBuilder.param('c','d');
            queryBuilder.param('e','f');
            should(`${queryBuilder}`.match(/=/g)||[]).have.length(3);
        });
        it(`should have no params after removing`, () => {
            queryBuilder.param('c','d');
            queryBuilder.remove('c');
            should(`${queryBuilder}`).be.empty;
        });
    });

    describe('Test Vectors', () => {
        it(`should exist`, () => {
            should(queryBuilder).have.property('_vector');
            should(queryBuilder._vector).have.property('field');
            should(queryBuilder._vector).have.property('value');
        });

        const vectorTest = function(field, func) {
            it(`should not have ${field}`, () => {
                should(queryBuilder._vector.field).not.be.equal(field);
            });
            it(`should have function ${func}`, () =>  {
                should(queryBuilder).have.property(func);
            });
            it(`should add vector ${field}`, () => {
                queryBuilder[func]('a');
                should(queryBuilder._vector.field).be.equal(field);
            });
        };
        it(`should add vector to query`, () => {
            queryBuilder.vector('a','b');
            should(`${queryBuilder}`.indexOf('a=b')).be.greaterThan(0);
        });
        it(`should override vector in query`, () => {
            queryBuilder.vector('a','b');
            queryBuilder.vector('c','d');
            should(`${queryBuilder}`.indexOf('a=b')).be.lessThan(0);
            should(`${queryBuilder}`.indexOf('c=d')).be.greaterThan(0);
        });
        for (let test of vectors) {
            vectorTest(...test);
        }
    });

    describe('Test Location', () => {
        it(`should not have location`, () => {
            should(queryBuilder._location.location).not.exist;
            should(queryBuilder._location.distance).not.exist;
        });
        it(`should have location`, () => {
            queryBuilder.location('21144','1');
            should(queryBuilder._location.location).be.equal('21144');
            should(queryBuilder._location.distance).be.equal('1');
        });
        it(`should add locations to query`, () => {
            queryBuilder.location('21144','1');
            should(`${queryBuilder}`.indexOf('location=21144')).be.greaterThan(0);
            should(`${queryBuilder}`.indexOf('distance=1')).be.greaterThan(0);
        });
    });

    describe('Test Multiple Conjuctions', () => {
        it(`should correctly set multiple parameters`, () => {
            queryBuilder.filterOther('a','b').vector('c','d').param('e','g');
            should(`${queryBuilder}`.indexOf('filter=a:b')).be.greaterThan(0);
            should(`${queryBuilder}`.indexOf('c=d')).be.greaterThan(0);
            should(`${queryBuilder}`.indexOf('e=g')).be.greaterThan(0);
        });
    });
});
