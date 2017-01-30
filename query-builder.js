'use-strict';
const _ = require('lodash');

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

class FilterObject {
    constructor(value, type = '') {
        if (! _.isArray(this.value)) value = [value];
        this.value = value;

        if (type !== 'or' || type !== '^') this._type = 'and';
        else this._type = type;
    }

    getType() {
        return this._type;
    }

    setType(type) {
        this._type = type === 'or' ? 'or' : 'and';

        return this;
    }

    checkType(type) {
        return type === this._type;
    }

    append(value) {
        if (value instanceof FilterObject && value.checkType(this._type)) {
            this.value = _.union(value.value);
        }
        else {
            this.value.push(value);
        }

        return this;
    }
}


/**
 * @class k
 * @property {object} _filter - filter object used to build the Kyruus search filter
 * @property {KyruusVector} _vector - which vector to use in the Kyruus search if any
 * @property {string} [_location.location] - which location to use in the Kyruus search if any
 * @property {string} [_location.distance] - what distance from a location to use in the Kyruus search if any
 */
class k {

    // Constants
    get NAME() {
        return 'name';
    }

    get SPECIALTYSYNONYM() {
        return 'specialty.synonym';
    }

    get CLINICALEXPERIENCE() {
        return 'clinical.experience';
    }

    get PRACTICEGROUP() {
        return 'practice.group';
    }

    get UNIFIED() {
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

        this._currentFilter = '';
    }

    get filter() {
        return this._filter;
    }

    /*
     * Location functions
     */

    location(location, distance) {
        return this._location = {location: location, distance: distance};
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
    _vector(field, value) {
        this._vector = {field: field, value: value};
        return this;
    }

    /**
     * @function name
     * @summary Changes the vector to a name vector and assigns the given value to the vector
     * @param {string} name - value for the Name
     * @return {k}
     */
    name(name) {
        return this._vector(this.NAME, name);
    }

    /**
     * @function specialtySynonym
     * @summary Changes the vector to a specialtySynonym vector and assigns the given value to the vector
     * @param {string} synonym - value for the specialtySynonym
     * @return {k}
     */
    // Figure out of this is correct
    specialtySynonym(synonym) {
        return this._vector(this.SPECIALTYSYNONYM, synonym);
    }

    /**
     * @function clinicalExperience
     * @summary Changes the vector to a clinicalExperience vector and assigns the given value to the vector
     * @param {string} experience - value for the clinicalExperience
     * @return {k}
     */
    // Figure out of this is correct
    clinicalExperience(experience) {
        return this._vector(this.CLINICALEXPERIENCE, experience);
    }

    /**
     * @function practiceGroup
     * @summary Changes the vector to a practiceGroup vector and assigns the given value to the vector
     * @param {string} group - value for the practiceGroup
     * @return {k}
     */
    // Figure out of this is correct
    practiceGroup(group) {
        return this._vector(this.PRACTICEGROUP, group);
    }

    /**
     * @function unified
     * @summary Changes the vector to a unified vector and assigns the given value to the vector
     * @param {string} unified - value for the unified
     * @return {k}
     */
    // Figure out of this is correct
    unified(unified) {
        return this._vector(this.UNIFIED, unified);
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
    filterOther(field, value, conjunction) {
        if (value instanceof k) {
            value = k.filter;
        }

        if (this._filter[field]) {
            value = new FilterObject(value);

            
            if (this._filter[field].checkType(conjunction)) {
                this._filter[field].append(value);
            }
            else {
                this._filter[field] = new FilterObject(this._filter[field], conjunction);
                this._filter[field].append(value);
            }
        }
        else {
            value = new FilterObject(value);
            this._filter[field] = value;
        }

        this._currentFilter = value;

        return this;
    }

    npi(npi) {
        return this.filterOther('npi', npi);
    }

    filterGender(gender) {
        return this.filterOther('gender', gender);
    }

    filterLocationName(location) {
        return this.filterOther('locations.name', location);
    }

    filterSpecialties(specialty) {
        return this.filterOther('specialties.specialty.untouched', specialty)
    }

    filterSubSpecialties(specialty) {
        return this.filterOther('specialties.subspecialty.untouched', specialty);
    }

    filterPracticeFocus(focus) {
        return this.filterOther('specialties.practice_focus.untouched', focus);
    }

    filterLocationCity(city) {
        return this.filterOther('locations.city', city);
    }

    filterLanguage(language) {
        return this.filterOther('languages.language', language);
    }

    filterAcceptingNewPatients(accepts = true) {
        return this.filterOther('accepting_new_patients', accepts);
    }

    and(value) {
        return this.filterOther(this._currentFilter, value, 'and');
    }

    or(value) {
        return this.filterOther(this._currentFilter, value, 'or');
    }

    andObject(value) {
        return this.filterOther(this._currentFilter, value, '^');
    }


    /*
     * Search sorting and page selection
     */

    shuffle(seed) {
        return this.other('shuffle_seed', seed);
    }

    sort(field) {
        return this.other('sort', field);
    }

    pageSize(size) {
        return this.other('per_page', size);
    }

    pageNumber(number) {
        return this.other('page', number);
    }

    get queryParams() {

    }
}

module.exports = k;