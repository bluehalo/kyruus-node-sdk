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

module.exports = {
    KyruusFacet,
    KyruusGeoCode,
    KyruusLocation,
    KyruusProvider,
    KyruusProviderSearch,
    KyruusSuggestions,
    KyruusSuggestionData,
    KyruusTypeAheadObject,
    KyruusTypeAhead,
}