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
    let filterTestString = 'YqmNuEMKZwb4Ih30Q8h0bAIJ622csxPv0gptSZxnzHVSYkTg5rJxZnx0oGfgpgnFvkWWZcF5FgnhG3rSbUX75fojB6wky7WwpcsEfIlh806YTugkn3xrnTTpjqzmIO'
    let filterTests = [['npis', 'npi']];

    describe('Test NPIs', () => {
        it('should not have npi field', () => {
            should.not.exist(queryBuilder._filter['npi']);
        });
        it('should have npi field', () => {
            queryBuilder.npis('123');
            should.exist(queryBuilder._filter['npi']);
        });
        it('npi filter should be FilterObject', () => {
            queryBuilder.npis('123');
            should(queryBuilder._filter['npi'] instanceof FilterObject);
        });
        it('npi filter should import single value', () => {
            queryBuilder.npis('123');
            should(queryBuilder._filter['npi'].size() === 1);
        });
        it('npi filter should import two values', () => {
            queryBuilder.npis('123', '456');
            should(queryBuilder._filter['npi'].size() === 2);
        });
        it('npi filter should remove values', () => {
            queryBuilder.npis('123', '456');
            should(queryBuilder._filter['npi'].size() > 1);
            queryBuilder.removeNpis('123');
            should(queryBuilder._filter['npi'].size() === 1);
        });
        it('npi filter should not exist', () => {
            queryBuilder.npis('123', '456');
            should.exist(queryBuilder._filter['npi']);
            queryBuilder.removeNpis('123', '456');
            should.not.exist(queryBuilder._filter['npi']);
        });
        it('query should not contain npi filter', () => {
            should(`${queryBuilder}`.indexOf('filter=npi:') < 0);
        });
        it('query should contain npi filter', () => {
            queryBuilder.npis('123');
            should(`${queryBuilder}`.indexOf('filter=npi:') > 0);
        });
        it('should format npi filter pipes', () => {
            queryBuilder.npis('123', '456');
            should(`${queryBuilder}`.indexOf('filter=npi:123|456') > 0);
        });
    });
});
