var Super = require('set')
  , inherit = require('inherit')
  , equal = require('equals')
  , splice = Array.prototype.splice

module.exports = Set

function Set (vals, model, name) {
	this._name = name
	this._model = model
	if (vals) {
		for (var i = 0, len = vals.length; i < len; i++) {
			if (!this.has(vals[i])) this[i] = vals[i]
		}
	}
	this.length = len || 0
}

// Inherit from jkroso/set
inherit(Set, Super)

var add = Super.prototype.add

Set.prototype.add = function (val) {
	var prev = this.toJSON()
	add.call(this, val)
	this._model.emitChange(this._name, this, prev)
	return this;
}

Set.prototype.del = function (val) {
	var prev = this.toJSON()
	this.remove(val)
	this._model.emitChange(this._name, this, prev)
	return this;
}

/**
 * Switch the set to contain only `vals`
 *
 * TODO: emit an event for each item added or removed
 *
 * @param {Array} vals
 * @return {this}
 */

Set.prototype.replaceValue = function (vals) {
	var changed = false
	  , prev = this.toJSON()

	var i = this.length
	while (i--) {
		if (!contains(vals, this[i])) {
			splice.call(this, i, 1)
			changed = true
		}
	}
	
	for (var i = 0, len = vals.length; i < len; i++) {
		if (!this.has(vals[i])) {
			this[this.length++] = vals[i]
			changed = true
		}
	}
	
	if (changed) this._model.emitChange(this._name, this, prev)

	return this
}

function contains (arr, val) {
	var i = arr.length
	while (i--) {
		if (equal(arr[i], val)) return true
	}
	return false
}
