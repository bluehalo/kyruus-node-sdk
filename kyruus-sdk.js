'use strict';
const https = require('https'),
    q = require('Q');

class Kyruus {

    constructor({endpoint = '', source = '', user = '', password = ''}) {
        this.endpoint = endpoint;
        this.source = source;
        this._userName = user;
        this._userPassword = password;
        this._token = null;
        this._expiresAt = (new Date()).getTime();
        this._refreshTokenLock = false;

        return this._refreshToken();
    }

    getDoctorByNpi(npi) {
        let options = {
            hostname: this.endpoint,
            path: '/pm/v8/' + this.source + '/providers?npi=' + encodeURIComponent(npi)
        };

        return this._https(options).then(result => {
            return _.get(result, 'providers[0]', result);
        });
    }

    getAllFacets() {
        let options = {
            hostname: this.endpoint,
            path: encodeURIComponent('/pm/v8/' + this.source + '/providers')
        };

        return this._https(options).then(result => {
            return _.get(result, 'facets', []);
        });
    }

    searchByLocation(location, distance) {
        let options = {
            hostname: this.endpoint,
            path: '/pm/v8/' + this.source + '/providers'
        };

        return this._https(options).then(result => {
            return _.get(result, 'facets', []);
        });
    }

    suggest(suggester, typeAheadCategory) {
        typeAheadCategory = (typeAheadCategory ? '&typeahead_categories=' + encodeURIComponent(typeAheadCategory) : '');

        let optionsOne = {
                hostname: this.endpoint,
                path: '/pm/v8/' + this.source + '/typeahead?terms=' + encodeURIComponent(suggester) + typeAheadCategory
            },
            optionsTwo = {
                hostname: this.endpoint,
                path: '/pm/v8/' + this.source + '/providers?name=' + encodeURIComponent(suggester)
            };

        return q.all([this._https(optionsOne), this._https(optionsTwo)]).spread((autoComplete, suggestions) => {
            return [];
        });
    }

    /**
     * @function search
     * @summary Does a generic search with the parameters provided if any
     * @param searchString
     * @return {promise|d.promise|*|r.promise}
     */
    search(searchString) {
        let options = {
            hostname: this.endpoint,
            path: '/pm/v8/' + this.source + '/providers' + (searchString ? `?${searchString}` : '')
        };

        return this._https(options);
    }

    /**
     * @function _refreshToken
     * @summary Checks to see if there is a valid access token, and if there isn't return a promise
     * that gets a new access token
     * @return {promise}
     * @private
     */
    _refreshToken() {
        if (this._expiresAt < (new Date()).getTime() - 60000) {
            q(this);
        }

        // Is a new access token already being requested
        if (this._refreshTokenLock) {
            return this._refreshTokenLock = q(this._refreshTokenLock);
        }

        let options = {
                hostname: this._endpoint,
                path: '/oauth2/token',
                method: 'POST',
            },
            body = {
                client_id: this._userName,
                client_secret: this._userPassword,
                grant_type: 'client_credentials'
            };


        return this._refreshTokenLock = this._https(options, body).then(result => {
            this._token = result;

            // Set the new session expiration timestamp. Give 20 seconds room for possible internet delay
            this._expiresAt = (new Date()).getTime() + (result.expires_in * 1000);

            return this;
        }).finally(() => {
            this._refreshTokenLock = false;
        });
    }

    /**
     * @function _generateDefaultOptions
     * @summary return an options object with enough information to return a 0 filter query on Kyruus
     * @param options
     * @return {*}
     * @private
     */
    _generateDefaultOptions(options) {
        options.hostname = options.hostname || this.endpoint + '/pm/v8/' + this.source + '/providers';
        options.auth = options.auth || this._userName+':' + this._userPassword;
        options.port = options.port || 443;
        options.mehod = options.mehod || 'GET';

        if (this._token) {
            options.Authorization = options.Authorization || `${this._token.token_type} ${this._token.access_token}`;
        }

        return options
    }

    /**
     * @function _https
     * @summary Wraps an https request using the given options within a promise
     * @param options
     * @return {promise|d.promise|*|r.promise}
     * @private
     */
    _https(options, body) {
        options = this._generateDefaultOptions(options);

        return this._refreshToken().then(() => {
            let req = https.request(options, res => {
                let str = '';

                // Another chunk of data has been received, so append it to 'str'
                res.on('data', function (chunk) {
                    str += chunk;
                })
                    .on('end', function () {
                        try {
                            let result = JSON.parse(str);

                            if (response.statusCode >= 400) {
                                return q.reject(req.results.message || str);
                            }
                        } catch (e) {
                            return q.reject(e);
                        }

                        return q.resolve(q.result);
                    })
                    .on('error', function (e) {
                        return q.reject(e);
                    });
            }).on('error', function (e) {
                return q.reject(e);
            });

            if (body) {
                if (typeof body !== 'string') {
                    body = JSON.stringify(body);
                }

                req.write(body);
            }

            req.end();
        });
    }
}

module.exports =  Kyruus;
