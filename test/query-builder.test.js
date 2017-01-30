'use strict';

let q = require('q'),
    _ = require('lodash'),
    should = require('should');

describe('Kyruus Query Builder', () => {
    let queryBuilder = null;

    beforeEach(() => {
        console.log('halp');
        queryBuilder = new (require('../query-builder'));
    });

    describe('test constructor object', () => {
        it('should have the required starting objects', () => {
            should.exist(queryBuilder);
            should.exist(queryBuilder.filter);
        });
    });
});
