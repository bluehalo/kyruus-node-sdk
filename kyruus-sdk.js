'use strict';
const https = require('https'),
	crypto = require('crypto'),
	q = require('q'),
	_ = require('lodash');

const k = require('./query-builder.js');

// Type Definitions
// TODO find meaning of TBD Objects
/**
 * A term for a single facet
 * @typedef {Object} FacetTerm
 * @property {number} count - number of doctors with this term for the parent facet
 * @property {string} value - value of the matching term
 */
class FacetTerm {
	constructor(count, value) {
		this.count = count;
		this.value = value;
	}
}

/**
 * A single Kyruus facet Object. For more information about facets, see:
 * https://support.kyruus.com/hc/en-us/articles/207465666-ProviderMatch-API-Search#facets
 * @typedef {Object} KyruusFacet
 * @property {string} field - the facet name
 * @property {number} missing - The number of matched doctors that do not match this facet
 * @property {number} other
 * @property {FacetTerm[]} terms - Array of all matching terms
 * @property {number} count - sum of all FacetTerm counts
 */
class KyruusFacet {
	constructor(field, missing, other, terms, count) {
		this.field = field;
		this.missing = missing;
		this.other = other;
		this.terms = terms;
		this.count = count;
	}
}

/**
 * Kyruus location Object
 * @typedef {Object} KyruusLocation
 * @property {string} city
 * @property {string} county
 * @property {string} fips - TBD
 * @property {string} plus4 - TBD
 * @property {string} state
 * @property {string} street
 * @property {string} street2
 * @property {string} suite
 * @property {string} type
 * @property {string} zip
 */
class KyruusLocation {
	constructor(city, county, fips, plus4, state, street, street2, suite) {
		this.city = city;
		this.county = county;
		this.fips = fips;
		this.plus4 = plus4;
		this.state = state;
		this.street = street;
		this.street2 = street2;
		this.suite = suite;
	}
}

/**
 * GeoCode Location Object returned by Kyruus
 * @typedef {Object} KyruusGeoCode
 * @property {number} coordinates.lat - Lat coordinate of the location
 * @property {number} coordinates.lon - Lon coordinate of the location
 * @property {KyruusLocation} location - location Object for the filter if a location was passed in
 */
class KyruusGeoCode {
	constructor(coordinates, location) {
		this.coordinates = coordinates;
		this.location = location;
	}
}

/**
 * Kyruus suggestion Object data
 * @typedef {Object} KyruusSuggestionData
 * @property {string[]} suggestions - Array of all possible suggestions
 * @property {string} term - search phrase entered for the current suggestions
 */
class KyruusSuggestionData {
	constructor(suggestions, term) {
		this.suggestions = suggestions;
		this.term = term;
	}
}

/**
 * Kyruus suggestion Object
 * @typedef {Object} KyruusSuggestions
 * @property {KyruusSuggestionData[]} [name] - an array of one KyruusSuggestionData Object
 */
class KyruusSuggestions {
	constructor(values) {
		_.each(values, (value, key) => {
			this[key] = value;
		})
	}
}

/**
 * Kyruus Provider object
 * @typedef {Object} KyruusProvider
 */
class KyruusProvider {
	constructor() {

	}
}

/**
 * A complete search response from Kyruus on the providers endpoint
 * @typedef {Object} KyruusProviderSearch
 * @property {null} alerts - TBD
 * @property {number} availability_format - TBD
 * @property {KyruusFacet[]} facets - Available facets for the returned search results
 * @property {KyruusGeoCode|Object} geocoded_location - geocoded location Object for the filter if a location was passed in
 * @property {Object} interpretation - TBD
 * @property {KyruusProvider[]} providers - Array of all matching providers (paged to 10 providers by default)
 * @property {KyruusSuggestions} suggestions - The suggestion Object returned by Kyruus
 * @property {number} total_providers - Total number of matching providers
 */
class KyruusProviderSearch {
	constructor(alerts, availability_format, facets, geocoded_location, interpretation, providers, suggestions, total_providers) {
		this.alerts = alerts;
		this.availability_format = availability_format;
		this.facets = facets;
		this.geocoded_location = geocoded_location;
		this.interpretation = interpretation;
		this.providers = providers;
		this.suggestions = suggestions;
		this.total_providers = total_providers;
	}
}

/**
 * Kyruus typeahead Object containing the autocomplete data
 * @typedef {Object} KyruusTypeAheadObject
 * @property {string} content_type - Content type the autocomplete came from
 * @property {string} value - Value used from the autocomplete
 * @property {string} [in_what] - What section of the value the mach came from
 * @property {string} [name] - Human readable version of the value if the value is not already
 */
class KyruusTypeAheadObject {
	constructor(content_type, value, in_what = undefined, name = undefined) {
		this.content_type = content_type;
		this.value = value;
		this.in_what = in_what;
		this.name = name;
	}
}

/**
 * Kyruus typeahead (autocomplete) Object return by the api
 * @typedef {Object} KyruusTypeAhead
 * @property {KyruusTypeAheadObject[]} exact.docs - Array of all possible
 * @property {number} exact.total - size of docs array
 */
class KyruusTypeAhead {
	constructor(exact) {
		this.exact = exact;
	}
}

/**
 * Default request options for Kyruus search
 * @typedef {Object} DefaultSearchOptions
 * @property {string} hostname - root url of the target endpoint
 * @property {number} [port=443] port - target port
 * @property {string} [method=GET] method - Target restful method
 * @property {string} [headers.Authorization] - Auth key for the query
 */

class Kyruus {
	get version() {
		return 'v8';
	}

	constructor(endpoint = '', source = '', user = '', password = '') {
		this.endpoint = endpoint;
		this.source = source;
		this._userName = user;
		this._userPassword = password;
		this._token = undefined;
		this._expiresAt = 0;
		this._refreshTokenLock = null;
	}

	/**
	 * @function __getTimeInSeconds
	 * @summary returns the current time in seconds
	 * @return {number} The current time in seconds
	 * @private
	 */
	__getTimeInSeconds() {
		return (new Date()).getTime() / 1000;
	}

	/**
	 * @function __rootQueryPath
	 * @summary returns the root path to the Kyruus api
	 * @return {string} The root query path to Kyruus
	 * @private
	 */
	__rootQueryPath() {
		return `/pm/${this.version}/${this.source}/`;
	}



	/**
	 * @function getProviderByNpi
	 * @summary return a kyruus doctor object searched by npi
	 * @param {number} npi - The doctor's npi
	 * @return {Promise.<KyruusProvider, Object>|*}
	 * Deprecated
	 */
	getProviderByNpi(npi) {
		return this.search('filter=npi:' + encodeURIComponent(npi)).then(result => {
			// This doctor only ever be absent if the npi does not map to a doctor
			return _.get(result, 'providers[0]', null);
		});
	}

	/**
	 * @function getAllFacets
	 * @summary returns all facet objects from kyruus for an empty search
	 * @return {Promise.<KyruusFacet[]>|*}
	 */
	getAllFacets() {
		return this.search().then(result => {
			return result.facets;
		});
	}

	/**
	 * @function searchByLocation
	 * @summary Returns a list of providers, facets, suggesters, etc within the given distance of a given location
	 * @param {string|number} location - Location to search against. Either "city, state" or zipcode
	 * @param {number} distance - Filter Boundary for how far a doctor can be from the location
	 * @return {Promise.<KyruusProviderSearch>|*}
	 */
	searchByLocation(location, distance) {
		return this.search(`location=${encodeURIComponent(location)}&distance=${encodeURIComponent(distance)}`);
	}

	/**
	 * @function suggest
	 * @summary Returns a list of suggestions generated by the kyruus suggesters and autocompletes
	 * @param {string} suggester - Phrase to find suggestions for
	 * @param {string} [typeAheadCategory=null] - Kyruus typeahead category to search against
	 * @return {Promise.<KyruusSuggestions>|*}
	 */
	suggest(suggester, typeAheadCategory = null) {
		typeAheadCategory = (typeAheadCategory ? '&typeahead_categories=' + encodeURIComponent(typeAheadCategory) : '');

		let optionsOne = 'terms=' + encodeURIComponent(suggester) + typeAheadCategory,
			optionsTwo = 'name=' + encodeURIComponent(suggester);

		return q.all([this.search(optionsOne, 'typeahead'), this.search(optionsTwo)]).spread((autoComplete, suggestions) => {
			suggestions = suggestions.suggestions;

			// Map all KyruusTypeAhead suggestions into the KyruusSuggestions object
			for (let suggestion of autoComplete.exact.docs) {
				// For names, the value will already be the public value where as all other fields have a value field
				// used for match and a name field for public view
				let value = suggestion.content_type === 'name' ? suggestion.value : suggestion.name;

				// Merge the two result objects into one array with the KyruusSuggestions format
				if (_.get(suggestions, suggestion.content_type, false)) {
					suggestions[suggestion.content_type][0].suggestions = _.union(suggestions[suggestion.content_type][0].suggestions, [value]);
				}
				else {
					suggestions[suggestion.content_type] = [{suggestions: [value], term: suggester}];
				}
			}

			return suggestions;
		});
	}

	/**
	 * @function getPath
	 * @summary Does a generic search with the parameters provided if any
	 * @param {string} [searchString=''] searchString - encoded filter string to send to Kyruus
	 * @param {string} [path=''] path - path to be appended to the root query path
	 * @param {string} [override=''] override - optional override parameter to override rootQueryPath + path
	 * @return {Promise.<KyruusProviderSearch>|*}
	 */
	getPath(searchString = '', path = 'providers', override = '') {
		const base = override ? override : this.__rootQueryPath() + path;
		return base + (searchString.length ? (searchString.charAt(0) === '?' ? searchString : '?' + searchString ) : '');
	}

	/**
	 * @function search
	 * @summary Does a generic search with the parameters provided if any
	 * @param {string} [searchString=''] searchString - encoded filter string to send to Kyruus
	 * @param {string} [path=''] path - path to be appended to the root query path
	 * @param {string} [override=''] override - optional override parameter to override rootQueryPath + path
	 * @return {Promise.<KyruusProviderSearch>|*}
	 */
	search(searchString = '', path = 'providers', override = '') {
		if(typeof(searchString) !== 'string' ) {
			searchString = `${searchString}`;
		}
		let options = {
			hostname: this.endpoint,
			path: this.getPath(searchString, path, override)
		};
		return this._refreshToken().then(() => this._https(this._generateDefaultOptions(options)));
	}

	/**
	 * @function query
	 * @summary returns a new query builder to start using
	 * @return {k}
	 */
	 query() {
		 return new k(this);
	 }

	/**
	 * @function _refreshToken
	 * @summary Checks to see if there is a valid access token, and if there isn't return a promise
	 * that gets a new access token
	 * @return {promise}
	 * @private
	 */
	_refreshToken() {
		if (this._expiresAt >= this.__getTimeInSeconds() - 60 && this._token !== undefined && this._refreshTokenLock) {
			return this._refreshTokenLock;
		}
		else if (this._token === null && this._refreshTokenLock) {
			return this._refreshTokenLock;
		}

		this._token = null;

		let separator = `-----WebKitFormBoundary${crypto.randomBytes(7).toString('hex')}`;

		let options = {
			"method": "POST",
			"hostname": this.endpoint,
			"port": null,
			"path": "/oauth2/token",
			"headers": {
				"content-type": "multipart/form-data; boundary=" + separator,
				"cache-control": "no-cache"
			}};

		separator = '--' + separator;

		// This is the body of the form request Kyruus uses to login
		let body = separator + "\r\nContent-Disposition: form-data; name=\"client_id\"\r\n\r\n" + this._userName + "\r\n"
			 + separator + "\r\nContent-Disposition: form-data; name=\"client_secret\"\r\n\r\n" + this._userPassword + "\r\n"
			 + separator + "\r\nContent-Disposition: form-data; name=\"grant_type\"\r\n\r\nclient_credentials\r\n"
			 + separator + "--";

		return this._refreshTokenLock = this._https(options, body).then(result => {
			this._token = result;

			// Set the new session expiration timestamp
			this._expiresAt = this.__getTimeInSeconds() + (_.get(result, 'expires_in', 0));

			return q(result);
		});
	}

	/**
	 * @function _generateDefaultOptions
	 * @summary return an options object with enough information to return a 0 filter query on Kyruus
	 * @param {Object} [options={}] options - http request options to check data for default values
	 * @return {DefaultSearchOptions}
	 * @private
	 */
	_generateDefaultOptions(options={}) {
		options.hostname = options.hostname || this.endpoint;
		options.port = options.port || 443;
		options.method = options.method || 'GET';

		if (this._token) {
			if (!options.headers) {
				options.headers = {};
			}
			options.headers.Authorization = options.headers.Authorization || `${this._token.token_type} ${this._token.access_token}`;
		}

		return options;
	}

	/**
	 * @function _https
	 * @summary Wraps an https request using the given options within a promise
	 * @param options
	 * @return {promise|d.promise|*|r.promise}
	 * @private
	 */
	_https(options, body) {
		return q.Promise((resolve, reject) => {
			let req = https.request(options, res => {
				let str = '';

				// Another chunk of data has been received, so append it to 'str'
				res.on('data', function (chunk) {
					str += chunk;
				})
					.on('end', function () {
						if (res.statusCode >= 400) {
							return reject({status: res.statusCode, message: res.statusMessage || str});
						}
						let result = {};

						try {
							result = JSON.parse(str);

						} catch (e) {
							return reject(e);
						}

						return resolve(result);
					})
					.on('error', function (e) {
						return reject(e);
					});
			});

			req.on('error', function (e) {
				return reject(e);
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
