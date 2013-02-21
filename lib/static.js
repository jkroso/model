
/**
 * Module dependencies.
 */

var request = require('superagent/lib/client')
  // TODO: replace with list-entity
  , Set = require('./set')
  , Emitter = require('emitter')
  , noop = function(){};

// mixin emitter
Emitter(exports);

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

exports.url = function(path){
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

exports.validate = function(fn){
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

exports.use = function(fn){
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

exports.attr = function(name, options){
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
        if (prev !== value) {
          this.dirty[name] = this.attrs[name] = value;
          this.emitChange(name, value, prev)
        }
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

exports.removeAll = function(fn){
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

exports.all = function(fn){
  var Self = this;
  var url = this.url('all');
  request.get(url, function(res){
    if (res.error) return fn(error(res));
    fn(null, res.body.map(function (model) {
      return new Self(model)
    }))
  });
};

/**
 * Get `id` and invoke `fn(err, model)`.
 *
 * @param {Mixed} id
 * @param {Function} fn
 * @api public
 */

exports.get = function(id, fn){
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
