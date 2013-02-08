
/**
 * Module dependencies.
 */

var proto = require('./proto')
  , statics = require('./static')
  , Set = require('./set')

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
    '(function '+name+'(attrs){\n' +
    '  if (!(this instanceof '+name+')) return new '+name+'(attrs)\n' +
    '  this._callbacks = {}\n' +
    '  this.dirty = {}\n' +
    '  this.attrs = {}\n' +
    // initialise its state
    '  var schema = '+name+'.attrs\n' +
    '  for (var prop in attrs) {\n' +
    '    if (prop in schema) {\n' +
    '      if (schema[prop].cardinality === \'many\') {\n' +
    '        this.attrs[prop] = new Set(attrs[prop], this, prop)\n' +
    '      } else {\n' +
    '        this.attrs[prop] = attrs[prop]\n' +
    '      }\n' +
    '    }\n' +
    '  }\n' +
    '})'
  )

  // class methods
  Model.base = '/' + name.toLowerCase();
  Model.attrs = {};
  Model.validators = [];
  for (var key in statics) Model[key] = statics[key];

  // instance methods
  for (var key in proto) Model.prototype[key] = proto[key];

  return Model;
}

