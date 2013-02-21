
var proto = require('./proto')  

module.exports = Model

/**
 * Base Model constructor. Can be used to 
 * make singleton models
 * 
 * @param {Object} attrs initial state
 * @return {Model}
 */

function Model (attrs) {
  if (!(this instanceof Model)) return new Model(attrs)
  this._callbacks = {}
  this.dirty = {}
  this.attrs = attrs || {}
}

// Extend the prototype
for (var fn in proto) {
  Model.prototype[fn] = proto[fn]
}

// void
Model.emit = Model.on = Model.off = function () {}
