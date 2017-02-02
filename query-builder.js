'use-strict';
const _ = require('lodash');

const FilterObject = require('./filter-object.js');

/**
 * @typedef KyruusVector
 * @summary A Kyruus vector is a search paramater that allows for more flexible matching techniques like partial matching
 * and inverted word. Search results are also sorted by quality and relevance
 *
 * There are only 5 vectors that can be used:
 *      Name - first, last, or full provider name
 *      Specialty Synonym - Provider's specialty
 *      Clinical Experience - If available, patient condition or medical term
 *      Practice Group - If available, provider practice group
 *      Unified - Search on ALL previous vectors and allows for mispellings
 *
 * @property {string} field - which vector to use if any
 * @property {string} value - what the vector should look for
 */


/**
 * @class k
 * @property {FilterObject} _filter - filter object used to build the Kyruus search filter
 * @property {KyruusVector} _vector - which vector to use in the Kyruus search if any
 * @property {string} [_location.location] - which location to use in the Kyruus search if any
 * @property {string} [_location.distance] - what distance from a location to use in the Kyruus search if any
 * @property {object} [_params] - Object of key:value pairs for kyruus api parameters
 */
class k {

    // Constants
    static get NAME() {
        return 'name';
    }

    static get SPECIALTYSYNONYM() {
        return 'specialty.synonym';
    }

    static get CLINICALEXPERIENCE() {
        return 'clinical.experience';
    }

    static get PRACTICEGROUP() {
        return 'practice.group';
    }

    static get UNIFIED() {
        return 'unified';
    }

    constructor() {
        // The filter structure will be a query tree
        //              and
        //         /                  \
        //        ^                   or
        //   /          \          /       \
        // AcceptsNew Primary  Laruel   Columbia
        this._filter = {};

        // Kyruus only allows for one vector object, this vector object will enforce that
        this._vector = {field: null, value: null};
        this._location = {location: null, distance: null};
        this._params = [];

        this._currentFilter = '';
    }

    get filter() {
        return this._filter;
    }

    /*
     * Location functions
     */

     /**
      * @function location
      * @summary Adds the special location filter to the query.
      * @param {string} location - Central location to sort by
      * @param {string} distance - Radius from the location in miles to match
      * @return {k}
      */
    location(location, distance) {
        this._location = {location: location, distance: distance};
        return this;
    }
    removeLocation(locatio, distance) {
        this._location = {location: null, distance: null};
        return this;
    }
    /*
     * Vector functions
     */

    /**
     * @function vector
     * @summary Assigns a search vector to use in Kyruus. Currently, there are only 5 vectors that can be used
     * which are expressed in the functions: name, specialtySynonym, clinincalExperience, practiceGroup, unified
     * @param {string} field - which type field to use
     * @param {string} value - value the vector should be looking for
     * @return {k}
     */
    vector(field, value) {
        this._vector.field = field;
        this._vector.value = value;
        return this;
    }

    /**
     * @function name
     * @summary Changes the vector to a name vector and assigns the given value to the vector
     * @param {string} name - value for the Name
     * @return {k}
     */
    name(name) {
        return this.vector(k.NAME, name);
    }

    /**
     * @function specialtySynonym
     * @summary Changes the vector to a specialtySynonym vector and assigns the given value to the vector
     * @param {string} synonym - value for the specialtySynonym
     * @return {k}
     */
    // Figure out of this is correct
    specialtySynonym(synonym) {
        return this.vector(k.SPECIALTYSYNONYM, synonym);
    }

    /**
     * @function clinicalExperience
     * @summary Changes the vector to a clinicalExperience vector and assigns the given value to the vector
     * @param {string} experience - value for the clinicalExperience
     * @return {k}
     */
    // Figure out of this is correct
    clinicalExperience(experience) {
        return this.vector(k.CLINICALEXPERIENCE, experience);
    }

    /**
     * @function practiceGroup
     * @summary Changes the vector to a practiceGroup vector and assigns the given value to the vector
     * @param {string} group - value for the practiceGroup
     * @return {k}
     */
    // Figure out of this is correct
    practiceGroup(group) {
        return this.vector(k.PRACTICEGROUP, group);
    }

    /**
     * @function unified
     * @summary Changes the vector to a unified vector and assigns the given value to the vector
     * @param {string} unified - value for the unified
     * @return {k}
     */
    // Figure out of this is correct
    unified(unified) {
        return this.vector(k.UNIFIED, unified);
    }

    /*
     * Standard filter functions
     */

    /**
     * @function filterOther
     * @summary Adds
     * @param {string} field - what filter to add the value to
     * @param {string} value - what to value to filter against in the field
     * @return {k}
     */
    filterOther(field, value, conjunction = 'or') {
        if (this._filter[field]) {
            if (this._filter[field].checkType(conjunction)) {
                this._filter[field].append(value);
            }
            else {
                this._filter[field] = new FilterObject(this._filter[field], conjunction);
                this._filter[field].append(value);
            }
        }
        else {
            this._filter[field] = new FilterObject(value);;
        }

        this._currentFilter = field;

        return this;
    }

    /**
     * @function removeFilter
     * @summary Removes a field from the query
     * @param {string} field - field to remove
     * @return {k}
     */
    param(field, value) {
        this._params[field] = value;
        return this;
    }

    /**
     * @function clearVector
     * @summary Removes a field from the query
     * @param {string} field - field to remove
     * @return {k}
     */
    clearVector() {
        this._vector = {field: null, value: null};
        return this;
    }

    /**
     * @function removeFromFilter
     * @summary Removes a value from a filter
     * @param {string} field - filter field
     * @param {string} value - value to remove from filter
     * @return {k}
     */
    removeFromFilter(field, value) {
        this.deleteFromFilter(field, value);
    }

    /**
     * @function deleteFromFilter
     * @summary Removes a value from a filter
     * @param {string} field - filter field
     * @param {string} value - value to remove from filter
     * @return {k}
     */
    deleteFromFilter(field, value) {
        if(this._filter[field] instanceof FilterObject) {
            this._filter[field].remove(value);
            if (this._filter[field].size() === 0) {
                delete this._filter[field];
            }
        }
        return this;
    }

    /**
     * @function removeFilter
     * @summary Removes a field from the query
     * @param {string} field - field to remove
     * @return {k}
     */
    remove(field) {
        return this.delete(field);
    }

    /**
     * @function deleteFilter
     * @summary Removes a field from the query
     * @param {string} field - field to remove
     * @return {k}
     */
    delete(field) {
        delete this._filter[field];
        delete this._params[field];
        if (this._vector.field === field) {
            this.clearVector();
        }

        return this;
    }

    /**
     * @function npis
     * @summary Adds npis to query
     * @param {...string} npis - npis to add
     * @return {k}
     */
    npis(...npis) {
        _.forEach(npis, (npi) => {
            this.filterOther('npi', npi);
        });
        return this;
    }

    /**
     * @function removeNpis
     * @summary Adds npis to query
     * @param {...string} npis - npis to add
     * @return {k}
     */
    removeNpis(...npis) {
        _.forEach(npis, (npi) => {
            this.removeFromFilter('npi', npi);
        });
        return this;
    }

    /**
     * @function gender
     * @summary Adds gender to query
     * @param {string} gender - gender to add
     * @return {k}
     */
    gender(gender) {
        return this.filterOther('gender', gender);
    }

    /**
     * @function removeGender
     * @summary Removes a gender from the query if it exists
     * @param {...string} npis - npis to add
     * @return {k}
     */
    removeGender(gender) {
        return this.removeFromFilter('gender', gender);
    }

    /**
     * @function locationNames
     * @summary Adds location names to query
     * @param {...string} locations - location names to add
     * @return {k}
     */
    locationNames(...locations) {
        _.forEach(locations, (location) => {
            this.filterOther('locations.name', location);
        });
        return this;

    }

    /**
     * @function removeLocationNames
     * @summary Removes location names from query
     * @param {...string} locations - locations to remove
     * @return {k}
     */
    removeLocationNames(...locations) {
        _.forEach(locations, (location) => {
            this.removeFromFilter('locations.name', location);
        });
        return this;

    }

    /**
     * @function specialties
     * @summary Adds specialties to query
     * @param {...string} specialties - specialties to add
     * @return {k}
     */
    specialties(...specialties) {
        _.forEach(specialties, (specialty) => {
            this.filterOther('specialties.specialty.untouched', specialty);
        });
        return this;
    }

    /**
     * @function removeSpecialties
     * @summary Removes specialties from query
     * @param {...string} specialties - specialties to remove
     * @return {k}
     */
    removeSpecialties(...specialties) {
        _.forEach(specialties, (specialty) => {
            this.removeFromFilter('specialties.specialty.untouched', specialty);
        });
        return this;
    }

    /**
     * @function subSpecialties
     * @summary Adds sub-specialties to query
     * @param {...string} specialties - sub-specialties to add
     * @return {k}
     */
    subSpecialties(...specialties) {
        _.forEach(specialties, (specialty) => {
            this.filterOther('specialties.subspecialty.untouched', specialty);
        });
        return this;
    }

    /**
     * @function removeSubSpecialties
     * @summary Removes sub-specialties from query
     * @param {...string} specialties - sub-specialties to remove
     * @return {k}
     */
    removeSubSpecialties(...specialties) {
        _.forEach(specialties, (specialty) => {
            this.removeFromFilter('specialties.subspecialty.untouched', specialty);
        });
        return this;
    }

    /**
     * @function practiceFocus
     * @summary Adds practice focus to query
     * @param {string} focus - Practice focus to add
     * @return {k}
     */
    practiceFocus(focus) {
        return this.filterOther('specialties.practice_focus.untouched', focus);
    }

    /**
     * @function removePracticeFocus
     * @summary Removes practice focus if it exists
     * @param {string} focus - Practice focus to remove
     * @return {k}
     */
    removePracticeFocus(focus) {
        return this.removeFromFilter('specialties.practice_focus.untouched', focus);
    }

    /**
     * @function cityLocations
     * @summary Adds city locations to query
     * @param {...string} cities - cities to add
     * @return {k}
     */
    cityLocations(...cities) {
        _.forEach(cities, (city) => {
            this.filterOther('locations.city', city);
        });
        return this;
    }

    /**
     * @function removeCityLocations
     * @summary Removes city locations from query
     * @param {...string} cities - cities to remove
     * @return {k}
     */
    removeCityLocations(...cities) {
        _.forEach(cities, (city) => {
            this.removeFromFilter('locations.city', city);
        });
        return this;
    }

    /**
     * @function languages
     * @summary Adds languages to query
     * @param {...string} cities - languages to add
     * @return {k}
     */
    languages(...languages) {
        _.forEach(languages, (language) => {
            this.filterOther('languages.language', language);
        });
        return this;
    }

    /**
     * @function removeLanguages
     * @summary Removes languages from query
     * @param {...string} cities - languages to remove
     * @return {k}
     */
    removeLanguages(...languages) {
        _.forEach(languages, (language) => {
            this.removeFromFilter('languages.language', language);
        });
        return this;
    }

    /**
     * @function acceptingNewPatients
     * @summary Adds accepting_new_patients filter to query
     * @param {boolean} accepts - filter on true/false if the provider is accepting new patients (default true)
     * @return {k}
     */
    acceptingNewPatients(accepts = true) {
        return this.filterOther('accepting_new_patients', accepts);
    }

    /**
     * @function filterAcceptingNewPatients
     * @summary Removes from accepting new patients if it exists
     * @param {boolean} accepts - remove true/false accepting new patients if it's set to that value
     * @return {k}
     */
    removeAcceptingNewPatients(accepts = true) {
        return this.removeFromFilter('accepting_new_patients', accepts);
    }

    /**
     * @function or
     * @summary Adds an additional value to the current filter as an or statement
     * @param {...string} values - Value(s) to append to the current filter key
     * @return {k}
     */
    or(...values) {
        _.forEach(values, (value) => {
            this.filterOther(this._currentFilter, value, 'or');
        });
        return this;
    }

    /**
     * @function with
     * @summary Adds additional filters to the current filter as a kyruus and (^) statement. Note: and statements can only be applied to same-object types. See kyruus documentation for more detail
     * @param {...object} keyValues - key value pairs to add. Key being the additional filter, and value being the string value on what to filter on.
     * @return {k}
     */
    with(...keyValues) {
        _.forEach(keyValues, (value) => {
            _.forIn(value, (value, key) => {
                this.filterOther(this._currentFilter, `${key}:${value}`, '^');
            });
        });
        return this;
    }


    /*
     * Search sorting and page selection
     */

     /**
      * @function shuffle
      * @summary Adds a seed to shuffle return results
      * @param {string} seed - String to seed the shuffle with
      * @return {k}
      */
    shuffle(seed) {
        return this.param('shuffle_seed', seed);
    }

    /**
     * @function removeShuffle
     * @summary Removes shuffle seed
     * @return {k}
     */
   removeShuffle() {
       return this.remove('shuffle_seed');
   }

    /**
     * @function sort
     * @summary Adds a field to sort results by
     * @param {string} seed - Field to sort by
     * @return {k}
     */
    sort(field) {
        return this.param('sort', field);
    }

    /**
     * @function removeSort
     * @summary Removes sorting on search results
     * @return {k}
     */
    removeSort() {
        return this.remove('sort');
    }

    /**
     * @function pageSize
     * @summary Sets the page size for return results
     * @param {string} size - Number of results per page
     * @return {k}
     */
    pageSize(size) {
        return this.param('per_page', size);
    }

    /**
     * @function removePageSize
     * @summary Removes page size parameter
     * @param {string} size - Number of results per page
     * @return {k}
     */
    removePageSize(size) {
        return this.remove('per_page', size);
    }

    /**
     * @function removePageSize
     * @summary Removes page size from query
     * @return {k}
     */
    removePageSize() {
        return this.remove('per_page');
    }

    /**
     * @function pageNumber
     * @summary Adds the page number to return results. The results are going to be [pageSize*pageNumber...pageSize*pageNumber+pageNumber-1]
     * @param {string} number - Page number
     * @return {k}
     */
    pageNumber(number) {
        return this.param('page', number);
    }

    /**
     * @function removePageNumber
     * @summary Removes page number from query
     * @return {k}
     */
    removePageNumber(number) {
        return this.remove('page');
    }

    /**
     * @function toString
     * @summary Converts object into a string formatted filter string for kyruus api calls
     * @return {string}
     */
    toString() {
        let queryParams = []
        let addQueryParam = function (val, key) {
            if(val && key) {
                queryParams.push(`${key}=${val}`);
            }
        }
        _.forIn(this._params, (val, key) => {
            addQueryParam(val, key);
        });
        let vectorKey = _.get(this,'_vector[field]', null);
        let vectorValue = _.get(this,'_vector[value]', null);
        if(vectorKey && vectorValue) {
            addQueryParam(vectorValue, vectorKey);
        }
        let location = _.get(this,'_location.location', null);
        let distance = _.get(this,'_location.distance', null);
        if(location) {
            addQueryParam(location, 'location');
            addQueryParam(distance, 'distance');
        }
        _.forIn(this._filter, (value, key) => {
            queryParams.push(`filter=${key}:${value}`);
        });

        return _.size(queryParams) > 0 ? '?'+_.join(queryParams, '&') : '';

    }
}
module.exports = k;
