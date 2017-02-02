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
                            ['page', 'pageNumber']];

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
                    should(queryBuilder.hasOwnProperty(func));
                });
                it(`should have remove function ${removeFunc}`, () => {
                    should(queryBuilder.hasOwnProperty(removeFunc));
                });
                it(`should not have ${field} field`, () => {
                    should(!queryBuilder._filter.hasOwnProperty(field));
                });
                it(`should have ${field} field`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._filter.hasOwnProperty(field));
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
                    should(queryBuilder._filter.hasOwnProperty(field));
                    queryBuilder[removeFunc](val1, val2);
                    should(!queryBuilder._filter.hasOwnProperty(field));
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
                    should(queryBuilder.hasOwnProperty(func));
                });
                it(`should have remove function ${removeFunc}`, () => {
                    should(queryBuilder.hasOwnProperty(removeFunc));
                });
                it(`should not have ${field} field`, () => {
                    should(!queryBuilder._filter.hasOwnProperty(field));
                });
                it(`should have ${field} field`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._filter.hasOwnProperty(field));
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
                    should(queryBuilder._filter.hasOwnProperty(field));
                    queryBuilder[removeFunc](val1);
                    should(!queryBuilder._filter.hasOwnProperty(field));
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
    describe('Test Parameters', () => {
        const filterTest = (field, func, val1, val2) => {
            let removeFunc = 'remove' + func.charAt(0).toUpperCase() + func.slice(1);
            describe(`Test ${func} filter`, () => {
                it(`should have function ${func}`, () => {
                    should(queryBuilder.hasOwnProperty(func));
                });
                it(`should have remove function ${removeFunc}`, () => {
                    should(queryBuilder.hasOwnProperty(removeFunc));
                });
                it(`should not have ${field} field`, () => {
                    should(!queryBuilder._params.hasOwnProperty(field));
                });
                it(`should have ${field} field`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._params.hasOwnProperty(field));
                });
                it(`${field} parameter should be overwritten`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._params[field] === val1);
                    queryBuilder[func](val2);
                    should(queryBuilder._params[field] === val2);
                });
                it(`${field} should not exist after remove`, () => {
                    queryBuilder[func](val1);
                    should(queryBuilder._params.hasOwnProperty(field));
                    queryBuilder[removeFunc]();
                    should(!queryBuilder._params.hasOwnProperty(field));
                });
                it(`query should not contain ${field} param`, () => {
                    should(`${queryBuilder}`.indexOf(`${field}=${val1}`) < 0);
                });
                it(`query should contain ${field} param`, () => {
                    queryBuilder[func](val1);
                    should(`${queryBuilder}`.indexOf(`${field}=${val1}`) > 0);
                });
            });
        };
        for (let test of parameterTests) {
            filterTest(...test, filterTestString.pop(), filterTestString.pop());
        }
    });
    describe('Test Filter Construction', () => {
        it(`should be empty`, () => {
            should(!`${queryBuilder}`);
        });
        it(`should not be empty`, () => {
            queryBuilder.filterOther('a','b');
            should(`${queryBuilder}`);
        });
        it(`should start with ?`, () => {
            queryBuilder.filterOther('a','b');
            should(`${queryBuilder}`.charAt(0) === '?');
        });
        it(`should have one param`, () => {
            queryBuilder.filterOther('a','b');
            queryBuilder.param('c','d');
            should((`${queryBuilder}`.match(/=/g)||[]).length === 1);
        });
        it(`should have three params`, () => {
            queryBuilder.filterOther('a','b');
            queryBuilder.param('c','d');
            queryBuilder.param('e','f');
            should((`${queryBuilder}`.match(/=/g)||[]).length === 3);
            should((`${queryBuilder}`.match(/&/g)||[]).length === 2);
        });
        it(`should have no params after removing`, () => {
            queryBuilder.param('c','d');
            queryBuilder.remove('c');
            should(!`${queryBuilder}`);
        });
    });
    describe('Test Remove', () => {
        it(`should be empty`, () => {
            should(!`${queryBuilder}`);
        });
        it(`should not be empty`, () => {
            queryBuilder.filterOther('a','b');
            should(`${queryBuilder}`);
        });
        it(`should start with ?`, () => {
            queryBuilder.filterOther('a','b');
            should(`${queryBuilder}`.charAt(0) === '?');
        });
        it(`should have one param`, () => {
            queryBuilder.filterOther('a','b');
            queryBuilder.param('c','d');
            should((`${queryBuilder}`.match(/=/g)||[]).length === 1);
        });
        it(`should have three params`, () => {
            queryBuilder.filterOther('a','b');
            queryBuilder.param('c','d');
            queryBuilder.param('e','f');
            should((`${queryBuilder}`.match(/=/g)||[]).length === 3);
            should((`${queryBuilder}`.match(/&/g)||[]).length === 2);
        });
        it(`should have no params after removing`, () => {
            queryBuilder.param('c','d');
            queryBuilder.remove('c');
            should(!`${queryBuilder}`);
        });
    });

    describe('Test Vectors', () => {
        it(`should exist`, () => {
            should(queryBuilder.hasOwnProperty('_vector'));
            should(queryBuilder._vector.hasOwnProperty('field'));
            should(queryBuilder._vector.hasOwnProperty('value'));
        });

        const vectorTest = function(field, func) {
            it(`should not have ${field}`, () => {
                should(queryBuilder._vector.field !== field);
            });
            it(`should have function ${func}`, () =>  {
                should(queryBuilder.hasOwnProperty(func));
            });
            it(`should add vector ${field}`, () => {
                queryBuilder[func]('a');
                should(queryBuilder._vector.field === field);
            });
        };
        for (let test of vectors) {
            vectorTest(...test);
        }
    });

    describe('Test Vectors', () => {
        it(`should exist`, () => {
            should(queryBuilder.hasOwnProperty('_vector'));
            should(queryBuilder._vector.hasOwnProperty('field'));
            should(queryBuilder._vector.hasOwnProperty('value'));
        });

        const vectorTest = function(field, func) {
            it(`should not have ${field}`, () => {
                should(queryBuilder._vector.field !== field);
            });
            it(`should have function ${func}`, () =>  {
                should(queryBuilder.hasOwnProperty(func));
            });
            it(`should add vector ${field}`, () => {
                queryBuilder[func]('a');
                should(queryBuilder._vector.field === field);
            });
        };
        it(`should add vector to query`, () => {
            queryBuilder.vector('a','b');
            should(`${queryBuilder}`.indexOf('a=b') > 0);
        });
        it(`should override vector in query`, () => {
            queryBuilder.vector('a','b');
            queryBuilder.vector('c','d');
            should(`${queryBuilder}`.indexOf('a=b') < 0);
            should(`${queryBuilder}`.indexOf('c=d') > 0);
        });
        for (let test of vectors) {
            vectorTest(...test);
        }
    });

    describe('Test Location', () => {
        it(`should not have location`, () => {
            should(!queryBuilder._location.location);
            should(!queryBuilder._location.distance);
        });
        it(`should have location`, () => {
            queryBuilder.location('21144','1');
            should(queryBuilder._location.location === '21144');
            should(queryBuilder._location.distance === '1');
        });
        it(`should add locations to query`, () => {
            queryBuilder.location('21144','1');
            should(`${queryBuilder}`.indexOf('&location=21144'));
            should(`${queryBuilder}`.indexOf('&distance=1'));
        });
    });

    describe('Test Multi', () => {
        it(`should not have location`, () => {
            should(!queryBuilder._location.location);
            should(!queryBuilder._location.distance);
        });
        it(`should have location`, () => {
            queryBuilder.location('21144','1');
            should(queryBuilder._location.location === '21144');
            should(queryBuilder._location.distance === '1');
        });
        it(`should add locations to query`, () => {
            queryBuilder.location('21144','1');
            should(`${queryBuilder}`.indexOf('&location=21144'));
            should(`${queryBuilder}`.indexOf('&distance=1'));
        });
    });
});
