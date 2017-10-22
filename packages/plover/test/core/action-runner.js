const co = require('co');
const sinon = require('sinon');
const ActionRunner = require('../../lib/core/action-runner');


describe('core/action-runner', function() {
  it('work with filters', function() {
    // Filter A
    const A = {
      beforeAction: function* () {
        this.info = {
          name: 'plover'
        };

        this.data.list = [];
      },

      afterAction: function* () {
        this.data.list.push('A');
      }
    };

    // Filter B
    const B = {
      beforeAction: function* () {
        this.info.desc = 'node js web framework';
      },

      afterAction: function() {
        this.data.list.push('B');
      }
    };

    const app = {};
    const filters = [
      {
        filter: A
      },
      {
        filter: B
      }
    ];
    const runner = new ActionRunner(app, { filters: filters });

    // Controller
    const C = {
      beforeAction: function() {
        this.info.version = '1.0';
      },

      view: function* () {
        this.data.list.push('C1');
      },

      afterAction: function() {
        this.data.list.push('C2');
      }
    };

    // ActionContext
    const ctx = {
      data: {}
    };

    const rd = {
      module: C,
      route: {
        module: 'test',
        action: 'view'
      }
    };

    return co(function* () {
      yield runner.run(rd, ctx);

      ctx.info.should.eql({
        name: 'plover',
        version: '1.0',
        desc: 'node js web framework'
      });

      // after render执行是逆序的
      ctx.data.list.should.eql(['C1', 'C2', 'B', 'A']);
    });
  });


  it('break in filter before action', function() {
    const A = {
      beforeAction: function() {
        this.body = 'ok';
        return false;
      }
    };

    const ctx = {};
    const rd = {
      route: {
        module: 'test',
        action: 'update'
      }
    };

    const runner = new ActionRunner({}, { filters: [{ filter: A }] });
    return co(function* () {
      yield runner.run(rd, ctx);
      ctx.body.should.equal('ok');
    });
  });


  it('break in action', function() {
    const controller = {
      view: function() {
        this.body = 'hello';
        return false;
      },
      afterAction: sinon.spy()
    };

    return co(function* () {
      const ctx = {};
      yield runAction(controller, ctx);
      ctx.body.should.equal('hello');
      controller.afterAction.called.should.be.false();
    });
  });


  it('no filter', function() {
    const controller = {
      view: sinon.spy()
    };

    return co(function* () {
      const ctx = {};
      yield runAction(controller, ctx);
      controller.view.called.should.be.true();
    });
  });


  it('break in controller beforeAction', function() {
    const controller = {
      beforeAction: function* () {
        this.body = 'hello';
        return false;
      },
      view: sinon.spy()
    };

    return co(function* () {
      const ctx = {};
      yield runAction(controller, ctx);
      ctx.body.should.equal('hello');
      controller.view.called.should.be.false();
    });
  });


  it('break in after filter', function() {
    const controller = {
      view: sinon.spy(),
      afterAction: function* () {
        return { content: 'hello world' };
      }
    };

    return co(function* () {
      const ctx = {};
      const ret = yield runAction(controller, ctx);
      ret.should.eql({ content: 'hello world' });
    });
  });


  it('work with arrow function', function() {
    const controller = {};
    controller.view = ctx => {
      ctx.body = 'hello';
    };

    return co(function* () {
      const ctx = {};
      yield runAction(controller, ctx);
      ctx.body.should.equal('hello');
    });
  });
});


function* runAction(controller, ctx) {
  const rd = {
    module: controller,
    route: {
      module: 'test',
      action: 'view'
    }
  };

  const runner = new ActionRunner({}, { filters: [] });
  return yield runner.run(rd, ctx);
}
