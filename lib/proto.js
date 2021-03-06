
/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , request = require('superagent/lib/client')
  , equal = require('equals')
  , noop = function(){};

/**
 * Mixin emitter.
 */

Emitter(exports);

/**
 * Register an error `msg` on `attr`.
 *
 * @param {String} attr
 * @param {String} msg
 * @return {Object} self
 * @api public
 */

exports.error = function(attr, msg){
  this.errors.push({
    attr: attr,
    message: msg
  });
  return this;
};

/**
 * Check if this model is new.
 *
 * @return {Boolean}
 * @api public
 */

exports.isNew = function(){
  var key = this.constructor.primaryKey;
  return ! this.has(key);
};

/**
 * Get / set the primary key.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

exports.primary = function(val){
  var key = this.constructor.primaryKey;
  if (!arguments.length) return this[key];
  this[key] = val
  return this;
};

/**
 * Validate the model and return a boolean.
 *
 * Example:
 *
 *    user.isValid()
 *    // => false
 *
 *    user.errors
 *    // => [{ attr: ..., message: ... }]
 *
 * @return {Boolean}
 * @api public
 */

exports.isValid = function(){
  this.validate();
  return !this.errors.length;
};

/**
 * Return `false` or an object
 * containing the "dirty" attributes.
 *
 * Optionally check for a specific `attr`.
 *
 * @param {String} [attr]
 * @return {Object|Boolean}
 * @api public
 */

exports.changed = function(attr){
  var dirty = this.dirty;
  if (Object.keys(dirty).length) {
    if (attr) return attr in dirty;
    return dirty;
  }
  return false;
};

/**
 * Perform validations.
 *
 * @api private
 */

exports.validate = function(){
  var fns = this.constructor.validators;
  this.errors = [];
  for (var i = 0, len = fns.length; i < len; i++) {
    fns[i](this)
  }
};

/**
 * Destroy the model and mark it as `.removed`
 * and invoke `fn(err)`.
 *
 * Events:
 *
 *  - `removing` before deletion
 *  - `remove` on deletion
 *
 * @param {Function} [fn]
 * @api public
 */

exports.remove = function(fn){
  fn = fn || noop;
  if (this.isNew()) return fn(new Error('not saved'));
  var self = this;
  var url = this.url();
  this.constructor.emit('removing', this);
  this.emit('removing');
  request.del(url, function(res){
    if (res.error) return fn(error(res));
    self.removed = true;
    self.constructor.emit('remove', self);
    self.emit('remove');
    fn();
  });
};

/**
 * Save and invoke `fn(err)`.
 *
 * Events:
 *
 *  - `save` on updates and saves
 *  - `saving` pre-update or save, after validation
 *
 * @param {Function} [fn]
 * @api public
 */

exports.save = function(fn){
  if (!this.isNew()) return this.update(fn);
  var self = this;
  var url = this.constructor.url();
  fn = fn || noop;
  if (!this.isValid()) return fn(new Error('validation failed'));
  this.constructor.emit('saving', this);
  this.emit('saving');
  request.post(url, self, function(res){
    if (res.error) return fn(error(res));
    if (res.body) self.primary(res.body.id);
    self.dirty = {};
    self.constructor.emit('save', self);
    self.emit('save');
    fn();
  });
};

/**
 * Update and invoke `fn(err)`.
 *
 * @param {Function} [fn]
 * @api private
 */

exports.update = function(fn){
  var self = this;
  var url = this.url();
  fn = fn || noop;
  if (!this.isValid()) return fn(new Error('validation failed'));
  this.constructor.emit('saving', this);
  this.emit('saving');
  request.put(url, self, function(res){
    if (res.error) return fn(error(res));
    self.dirty = {};
    self.constructor.emit('save', self);
    self.emit('save');
    fn();
  });
};

/**
 * Return a url for `path` relative to this model.
 *
 * Example:
 *
 *    var user = new User({ id: 5 });
 *    user.url('edit');
 *    // => "/users/5/edit"
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

exports.url = function(path){
  var url = this.constructor.base;
  var id = this.primary();
  if (!arguments.length) return url + '/' + id;
  return url + '/' + id + '/' + path;
};

/**
 * Set `attr` to `value`. If attr is an object 
 * then it will be merged
 *
 * @param {String|Object} attr
 * @param {Any} value
 * @return {this}
 * @api public
 */

exports.set = function(attr, value){
  if (typeof attr === 'object') return this.merge(attr)
  var prev = this.attrs[attr]
  if (prev && typeof prev.replaceValue === 'function') {
    prev.replaceValue(value)
  } else if (!equal(prev, value)) {
    this.dirty[attr] = this.attrs[attr] = value
    this.emitChange(attr, value, prev)
  }
  return this
};

/**
 * set multiple values
 *
 * @param {Object} attrs
 * @return {this}
 */

exports.merge = function (attrs) {
  for (var key in attrs) {
    this.set(key, attrs[key])
  }
  return this
}

/**
 * Get `attr` value.
 *
 * @param {String} attr
 * @return {Mixed}
 * @api public
 */

exports.get = function(attr){
  return this.attrs[attr];
};

/**
 * Check if `attr` is present (not `null` or `undefined`).
 *
 * @param {String} attr
 * @return {Boolean}
 * @api public
 */

exports.has = function(attr){
  return this.attrs[attr] != null
};

/**
 * Return the JSON representation of the model.
 *
 * @return {Object}
 * @api public
 */

exports.toJSON = function(){
  return this.attrs;
};

/**
 * Emit all events that are based on a property change
 *
 * @param {String} name the property thats changed
 * @param {Any} val
 * @param {Any} prev
 * @private
 */

exports.emitChange = function (name, val, prev) {
  var clas = this.constructor
  clas.emit('change', this, name, val, prev);
  clas.emit('change ' + name, this, val, prev);
  this.emit('change', name, val, prev);
  this.emit('change ' + name, val, prev);
}

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
