'use-strict';
const _ = require('lodash');

class FilterObject {
	/**
	 * Object for keeping track of kyruus filters
	 * @param {string} value - value of filter
	 * @param {string} type - the conjuction for the filter (| or ^)
	 * @constructor
	*/
	constructor(value, type = '') {
		if (! _.isArray(this._value)) value = [value];
		this._value = value;
		this.setType(type);
	}
	/**
	 * @function getType
	 * @summary Returns the conjugation type (or(|) or and(^))
	 * @return {string}
	 */
	getType() {
		return this._type;
	}

	/**
	 * @function getType
	 * @summary Returns the number of filters in this object
	 * @return {number}
	 */
	size() {
		return this._value.length;
	}

	/**
	 * @function delete
	 * @summary Removes the value from the filter
	 * @param {string} value - value to remove
	 * @return {string}
	 */
	remove(value) {
		_.forEach(this._value, (val) => {
			if (val instanceof FilterObject) {
				val.remove(value);
				if (val._value.length === 0) {
					_.pull(this._value, val);
				}
			}
			else {
				_.pull(this._value, value);
			}
		});
		return this;
	}

	/**
	 * @function setType
	 * @summary Sets the conjugation type (or(|) or and(^))
	 * @return {string}
	 */
	setType(type) {
		this._type = type !== '^' ? '|' : '^';
		return this;
	}

	/**
	 * @function checkType
	 * @summary Compares the conjugation type (or(|) or and(^))
	 * @return {boolean}
	 */
	checkType(type) {
		return type === this._type;
	}

	/**
	 * @function append
	 * @summary Adds a value to the filter
	 * @return {string}
	 */
	append(value) {
		this._value.push(value);
		return this;
	}
	/**
	 * @function toString
	 * @summary Converts the filter object into seperating its filters by its conjugation type
	 * @return {string}
	 */
	toString() {
		return _.join(this._value, this._type);
	}
}

module.exports = FilterObject;
