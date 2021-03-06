
/**
 * Module dependencies.
 */

var Base = require('./base')
  , List = require('list-entity')
  , fns = require('./static')
  , inherit = require('inherit')

/**
 * Expose `createModel`.
 */

module.exports = createModel;

/**
 * Create a new model constructor with the given `name`.
 *
 * @param {String} name
 * @param {Function} [Model] base class
 * @return {Function}
 * @api public
 */

function createModel(name, Model) {
  if (typeof name != 'string') throw new TypeError('model name required');
  // class methods are also inherited
  var statics = Model

  // default to inheriting from Base 
  if (!Model) {
    Model = Base
    statics = fns
  }

  /**
   * Initialize a new model. 
   * Its initial state will come from `attrs`.
   *
   * @param {Object} attrs
   * @api public
   */

  var model = eval(
    '(function '+name+'(attrs){\n' +
    '  if (!(this instanceof '+name+')) return new '+name+'(attrs)\n' +
    '  this._callbacks = {}\n' +
    '  this.dirty = {}\n' +
    '  this.attrs = {}\n' +
    '  '+name+'.items.add(this)\n' +
    // initialise its state
    '  attrs || (attrs = this.attrs)\n' +
    '  var schema = this.constructor.attrs\n' +
    '  for (var prop in schema) {\n' +
    '    var val = prop in attrs\n' +
    '      ? attrs[prop]\n' +
    '      : schema[prop].default\n' +
    '    var Manager = schema[prop].manager\n' +
    '    this.attrs[prop] = Manager\n' +
    '      ? new Manager(val, this, prop)\n' +
    '      : val\n' +
    '  }\n' +
    '})'
  )

  // class methods
  for (var key in statics) model[key] = statics[key];
  model.base = '/' + name.toLowerCase();
  model.attrs = {};
  model.validators = [];
  model.items = new List
  model.on('remove', function (instance) {
    model.items.remove(instance)
  })

  // inherit from `Model`
  inherit(model, Model)

  return model;
}
