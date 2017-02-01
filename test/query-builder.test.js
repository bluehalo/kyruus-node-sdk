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

    describe('Test Multi Filters', () => {
        const filterTest = (field, func, val1, val2) => {
            let removeFunc = 'remove' + func.charAt(0).toUpperCase() + func.slice(1);
            describe(`Test ${func} filter`, () => {
                it(`should have function ${func}`, () => {
                    should.not.exist(queryBuilder._filter[field]);
                });
                it(`should have remove function ${removeFunc}`, () => {
                    should.not.exist(queryBuilder._filter[field]);
                });
                it(`should not have ${field} field`, () => {
                    should.not.exist(queryBuilder._filter[field]);
                });
                it(`should have ${field} field`, () => {
                    queryBuilder[func](val1);
                    should.exist(queryBuilder._filter[field]);
                });
                it(`${field} filter should be FilterObject`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._filter[field] instanceof FilterObject);
                });
                it(`${field} filter should import single value`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._filter[field].size() === 1);
                });
                it(`${field} filter should import two values`, () => {
                    queryBuilder[func](val1, val2);
                    should(queryBuilder._filter[field].size() === 2);
                });
                it(`${field} filter should remove values`, () => {
                    queryBuilder[func](val1, val2);
                    should(queryBuilder._filter[field].size() > 1);
                    queryBuilder[removeFunc](val1);
                    should(queryBuilder._filter[field].size() === 1);
                });
                it(`${field} filter should not exist`, () => {
                    queryBuilder[func](val1, val2);
                    should.exist(queryBuilder._filter[field]);
                    queryBuilder[removeFunc](val1, val2);
                    should.not.exist(queryBuilder._filter[field]);
                });
                it(`query should not contain ${field} filter`, () => {
                    should(`${queryBuilder}`.indexOf(`filter=${field}:`) < 0);
                });
                it(`query should contain ${field} filter`, () => {
                    queryBuilder[func](val1);
                    should(`${queryBuilder}`.indexOf(`filter=${field}:`) > 0);
                });
                it(`should format npi filter pipes`, () => {
                    queryBuilder[func](val1, val2);
                    should(`${queryBuilder}`.indexOf(`filter=${field}:${val1}|${val2}`) > 0);
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
                    should.not.exist(queryBuilder._filter[field]);
                });
                it(`should have remove function ${removeFunc}`, () => {
                    should.not.exist(queryBuilder._filter[field]);
                });
                it(`should not have ${field} field`, () => {
                    should.not.exist(queryBuilder._filter[field]);
                });
                it(`should have ${field} field`, () => {
                    queryBuilder[func](val1);
                    should.exist(queryBuilder._filter[field]);
                });
                it(`${field} filter should be FilterObject`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._filter[field] instanceof FilterObject);
                });
                it(`${field} filter should import single value`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._filter[field].size() === 1);
                });
                it(`${field} filter should not exist`, () => {
                    queryBuilder[func](val1);
                    should.exist(queryBuilder._filter[field]);
                    queryBuilder[removeFunc](val1);
                    should.not.exist(queryBuilder._filter[field]);
                });
                it(`query should not contain ${field} filter`, () => {
                    should(`${queryBuilder}`.indexOf(`filter=${field}:`) < 0);
                });
                it(`query should contain ${field} filter`, () => {
                    queryBuilder[func](val1);
                    should(`${queryBuilder}`.indexOf(`filter=${field}:`) > 0);
                });
            });
        };
        for (let test of singleFilterTests) {
            filterTest(...test, filterTestString.pop(), filterTestString.pop());
        }

    });
});
