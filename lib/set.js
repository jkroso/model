var Super = require('set')

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
Set.prototype = Object.create(Super.prototype)
Set.prototype.constructor = Set

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
