
/**
 * Module dependencies.
 */

var request = require('superagent/lib/client')
  , Set = require('./set')
  , Emitter = require('emitter')
  , proto = require('./proto')  
  , noop = function(){};

module.exports = Model

/**
 * Base Model constructor
 * 
 * @param {Object} attrs initial state
 * @return {Model}
 */

function Model (attrs) {
  if (!(this instanceof Model)) return new Model(attrs)
  this._callbacks = {}
  this.dirty = {}
  this.attrs = {}
  if (!attrs) return
  // initialise its state
  var schema = this.constructor.attrs
  for (var prop in schema) {
    var val = attrs[prop]
    if (schema[prop].cardinality === 'many') {
      if (val) val = val instanceof Array ? val : [val]
      this.attrs[prop] = new Set(val, this, prop)
    } else {
      this.attrs[prop] = val
    }
  }
}

// Extend the prototype
for (var fn in proto) {
  Model.prototype[fn] = proto[fn]
}

// mixin emitter
Emitter(Model);

/**
 * Construct a url to the given `path`.
 *
 * Example:
 *
 *    User.url('add')
 *    // => "/users/add"
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

Model.url = function(path){
  var url = this.base;
  if (!arguments.length) return url;
  return url + '/' + path;
};

/**
 * Add validation `fn()`.
 *
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

Model.validate = function(fn){
  this.validators.push(fn);
  return this;
};

/**
 * Use the given plugin `fn()`.
 *
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

Model.use = function(fn){
  fn(this);
  return this;
};

/**
 * Define attr with the given `name` and `options`.
 *
 * @param {String} name
 * @param {Object} options
 * @return {Function} self
 * @api public
 */

Model.attr = function(name, options){
  this.attrs[name] = options || (options = {});

  // implied pk
  if ('_id' == name || 'id' == name) {
    this.attrs[name].primaryKey = true;
    this.primaryKey = name;
  }

  // getter / setter method
  Object.defineProperty(this.prototype, name, {
    get: function () {return this.attrs[name]},
    set: options.cardinality === 'many'
      ? function (value) {
        var prev = this.attrs[name];
        var val = new Set(value, this, name)
        this.dirty[name] = this.attrs[name] = val;
        this.emitChange(name, val, prev)
      }
      : function (value) {
        var prev = this.attrs[name];
        this.dirty[name] = this.attrs[name] = value;
        this.emitChange(name, value, prev)
      },
    enumerable: true
  })

  return this;
}

/**
 * Remove all and invoke `fn(err)`.
 *
 * @param {Function} [fn]
 * @api public
 */

Model.removeAll = function(fn){
  fn = fn || noop;
  var self = this;
  var url = this.url('all');
  request.del(url, function(res){
    if (res.error) return fn(error(res));
    fn();
  });
};

/**
 * Get all and invoke `fn(err, array)`.
 *
 * @param {Function} fn
 * @api public
 */

Model.all = function(fn){
  var self = this;
  var url = this.url('all');
  request.get(url, function(res){
    if (res.error) return fn(error(res));
    fn(null, res.body);
  });
};

/**
 * Get `id` and invoke `fn(err, model)`.
 *
 * @param {Mixed} id
 * @param {Function} fn
 * @api public
 */

Model.get = function(id, fn){
  var self = this;
  var url = this.url(id);
  request.get(url, function(res){
    if (res.error) return fn(error(res));
    var model = new self(res.body);
    fn(null, model);
  });
};

/**
 * Response error helper.
 *
 * @param {Response} er
 * @return {Error}
 * @api private
 */

function error(res) {
  return new Error('got ' + res.status + ' response');
}
