const co = require('co');

const invoker = require('../../lib/util/invoker');

/* eslint require-yield: 0 */

describe('util/invoker', function() {
  it('.filter', function() {
    const ctx = {};

    const f1 = {
      before: function* () {
        this.f1 = 'hello';
        this.should.equal(ctx);
      }
    };

    const f2 = {
      before: function() {
        this.f2 = 'world';
      }
    };


    const f3 = {};

    const list = [
      { filter: f1 },
      { filter: f2 },
      { filter: f3 }
    ];

    return co(function* () {
      yield invoker.filter(list, 'before', ctx);
      ctx.f1.should.equal('hello');
      ctx.f2.should.equal('world');
    });
  });


  it('.filter - break with false', function() {
    const ctx = { };

    const f1 = {
      before: async function() {
        this.f1 = 'hello';
        return false;
      }
    };

    const f2 = {
      before: function* () {
        this.f2 = 'world';
      }
    };

    const list = [
      { filter: f1 },
      { filter: f2 }
    ];

    return co(function* () {
      yield invoker.filter(list, 'before', ctx);
      ctx.f1.should.equal('hello');
      (ctx.f2 === undefined).should.be.true();
    });
  });


  it('.filter - break with object', function() {
    const ctx = { };
    const f1 = {
      before: function() {
        return { context: 'hello world' };
      }
    };
    const f2 = {
      before: function() {
      }
    };
    const list = [
      { filter: f1 },
      { filter: f2 }
    ];

    co(function* () {
      const o = yield invoker.filter(list, 'before', ctx);
      o.should.eql({ context: 'hello world' });
    });
  });


  it('.filter - reverse', function() {
    const bag = [];

    const f1 = {
      before: function() {
        bag.push('hello');
      }
    };

    const f2 = {
      before: function() {
        bag.push('world');
      }
    };

    const list = [
      { filter: f1 },
      { filter: f2 }
    ];

    return co(function* () {
      yield invoker.filter(list, 'before', {}, true);
      bag.should.eql(['world', 'hello']);
    });
  });
});

