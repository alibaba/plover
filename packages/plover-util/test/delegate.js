const delegate = require('..').delegate;


describe('plover-util/lib/delegate', function() {
  it('should delegate methods to target object', function() {
    const target = {
      name: 'hello',
      say: function() {
        return this.name;
      },
      ok: function() {
        return this.name + ' ok';
      }
    };

    const o = {};
    delegate(o, target, ['say', 'ok']);
    o.say().should.equal('hello');
    o.ok().should.equal('hello ok');
  });


  it('should throw error when target method undefined', function() {
    const target = {};
    const o = {};
    (() => {
      delegate(o, target, ['hello']);
    }).should.throw('target method undefined: hello');
  });
});
