
var model = require('../lib')
  , assert = require('chai').assert
  , should = require('chai').should()

var User 
beforeEach(function () {
  User = model('User')
    .attr('id', { type: 'number' })
    .attr('name', { type: 'string' })
    .attr('age', { type: 'number' })
})

describe('Model.url()', function(){
  it('should return the base url', function(){
    assert('/user' == User.url());
  })
})

describe('Model.url(string)', function(){
  it('should join', function(){
    assert('/user/edit' == User.url('edit'));
  })
})

describe('Model.attrs', function(){
  it('should hold the defined attrs', function(){
    assert('string' == User.attrs.name.type);
    assert('number' == User.attrs.age.type);
  })
})

describe('Model.all(fn)', function(){
  beforeEach(function(done){
    User.removeAll(done);
  });

  beforeEach(function(done){
    var tobi = new User({ name: 'tobi', age: 2 });
    var loki = new User({ name: 'loki', age: 1 });
    var jane = new User({ name: 'jane', age: 8 });
    tobi.save(function(){
      loki.save(function(){
        jane.save(done);
      });
    });
  })

  it('should respond with a snapshot of all users', function(done){
    User.all(function(err, users){
      assert(!err);
      // assert(3 == users.length());
      // assert('tobi' == users.at(0).name());
      // assert('loki' == users.at(1).name());
      // assert('jane' == users.at(2).name());
      done();
    });
  })
})

describe('Model.items', function () {
  it('should contain all instances', function () {
    var jake = new User({name:'jake'})
    assert(User.items.size() === 1)
    assert(jake === User.items.toJSON()[0])
  })

  it('should not contain instances which have been destroyed', function (done) {
    var jake = new User({name:'jake'})
    assert(User.items.size() === 1)
    jake.save(function(){
      jake.remove(function (err) {
        if (err) throw err
        assert(User.items.size() === 0)
        done()
      })
    });
  })
})