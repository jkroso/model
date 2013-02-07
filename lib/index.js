
/**
 * Module dependencies.
 */

var proto = require('./proto')
  , statics = require('./static')
  , Emitter = require('emitter');

/**
 * Expose `createModel`.
 */

module.exports = createModel;

/**
 * Create a new model constructor with the given `name`.
 *
 * @param {String} name
 * @return {Function}
 * @api public
 */

function createModel(name) {
  if ('string' != typeof name) throw new TypeError('model name required');

  /**
   * Initialize a new model with the given `attrs`.
   *
   * @param {Object} attrs
   * @api public
   */

  var Model = eval(
    '(function '+name+'(attrs){\n'+
    '  if (!(this instanceof '+name+')) return new '+name+'(attrs);\n'+
    '  attrs = attrs || {};\n' +
    '  this._callbacks = {};\n' +
    '  this.attrs = attrs;\n' +
    '  this.dirty = attrs;\n' +
    '})'
  )

  // mixin emitte

  Emitter(Model);

  // statics

  Model.base = '/' + name.toLowerCase();
  Model.attrs = {};
  Model.validators = [];
  for (var key in statics) Model[key] = statics[key];

  // prototype

  Model.prototype = {};
  Model.prototype.model = Model;
  for (var key in proto) Model.prototype[key] = proto[key];

  return Model;
}

