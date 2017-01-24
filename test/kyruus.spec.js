'use strict';

let q = require('q'),
    _ = require('lodash'),
    should = require('should'),
    Kyruus = require('../kyruus-sdk');

describe('Kyruus SDK', () => {
    before(() => {
        return (new Kyruus()).then(result => {
            Kyruus = result;
        });
    });

    describe('GetClientUserAgent', function() {
        it('Should an empty test', () => {
            return q(true);
        });
    });
});
