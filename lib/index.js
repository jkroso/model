
/**
 * Module dependencies.
 */

var Base = require('./static')

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

function createModel(name, Model) {
  if (typeof name != 'string') throw new TypeError('model name required');

  // default to inheriting from Base 
  Model || (Model = Base)

  /**
   * Initialize a new model with the given `attrs`.
   *
   * @param {Object} attrs
   * @api public
   */

  var model = eval(
    '(function '+name+'(attrs){\n' +
    '  if (!(this instanceof '+name+')) return new '+name+'(attrs)\n' +
    '  Model.call(this, attrs)\n' +
    '  '+name+'.items.push(this)\n' +
    '})'
  )

  // class methods
  for (var key in Model) model[key] = Model[key];
  model.base = '/' + name.toLowerCase();
  model.attrs = {};
  model.validators = [];
  model.items = []

  // inherit from `Model`
  model.prototype = Object.create(Model.prototype, {constructor:{value:model}})

  return model;
}

