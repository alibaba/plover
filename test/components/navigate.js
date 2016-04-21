'use strict';


const co = require('co');
const koa = require('koa');
const sinon = require('sinon');
const request = require('supertest');
const jsonp = require('jsonp-body');

const Logger = require('plover-logger');

const NavigateComponent = require('../../lib/components/navigate');
const ActionContext = require('../../lib/core/action-context');
const Navigator = require('../../lib/core/navigator');


describe('components/navigate', function() {
  it('允许应用添加渲染相关的各种部件', function() {
    const app = {
      proto: {},
      addMiddleware: sinon.spy()
    };

    const nav = new NavigateComponent(app);

    const engine = { compile: () => {} };
    nav.addEngine('art', engine);
    app.engines.art.should.equal(engine);

    const AssetsHelper = { startup: sinon.spy() };
    nav.addHelper('assets', AssetsHelper);

    AssetsHelper.startup.called.should.be.true();
    AssetsHelper.startup.args[0][0].should.be.equal(app.proto);

    app.helpers.assets.should.equal(AssetsHelper);

    const TestFilter = { $name: 'TestFilter' };
    nav.addFilter(TestFilter, 2);

    const XViewFilter = { $name: 'XViewFilter' };
    nav.addFilter(XViewFilter);

    app.filters[0].should.eql({
      name: 'TestFilter',
      filter: TestFilter,
      level: 2
    });

    app.filters[1].should.eql({
      name: 'XViewFilter',
      filter: XViewFilter,
      level: 3
    });
  });


  before(function() {
    stubNavigate();
    sinon.stub(ActionContext, 'refine');    // prevent refine
  });

  after(function() {
    Navigator.prototype.navigate.restore();
    ActionContext.refine.restore();
  });


  describe('不同类型的结果能正常输出', function() {
    const agent = createAgent();

    it('非plover模块访问', function() {
      return agent.get('/hello').expect('/hello');
    });


    it('返回html', function() {
      return agent.get('/?module=index&action=view')
          .expect(JSON.stringify({ module: 'index', action: 'view' }));
    });


    it('返回json', function() {
      return agent.get('/?module=index&action=update&type=json')
          .expect('Content-Type', 'application/json')
          .expect({ module: 'index', action: 'update' });
    });


    it('返回jsonp结果', function() {
      return agent.get('/?module=index&action=update&type=json&callback=myjsonp')
          .expect('Content-Type', 'text/javascript')
          .expect(jsonp({ module: 'index', action: 'update' }, 'myjsonp'));
    });


    it('not found', function() {
      return agent.get('/?module=notfound&action=view')
          .expect(404);
    });


    it('invalid result', function() {
      sinon.stub(Logger.prototype, 'error');
      return co(function* () {
        yield agent.get('/?module=invalid')
            .expect(500)
            .expect(/Internel Server Error/);
        Logger.prototype.error.called.should.be.true();
        Logger.prototype.error.args[0][0].should.match(/invalid navigate result/);
        Logger.prototype.error.restore();
      });
    });
  });
  //~


  it('子类可以提供$jsonp来自定义jsonp的输出', function() {
    const myjsonp = function(o) {
      return `myjsonp: ${JSON.stringify(o)}`;
    };
    const agent = createAgent({
      $jsonp: function(ctx, data) {
        ctx.body = myjsonp(data);
      }
    });
    return agent.get('/?module=index&action=update&type=json&callback=myjsonp')
      .expect(myjsonp({ module: 'index', action: 'update' }));
  });


  it('开发模式下输出会打日志', function() {
    Logger.level = 'debug';
    sinon.spy(Logger.prototype, 'debug');
    const agent = createAgent();
    return co(function* () {
      yield agent.get('/?module=index&action=view')
        .expect(200);

      yield agent.get('/?module=index&action=view&type=json')
        .expect(200);

      const args = Logger.prototype.debug.args;
      args[args.length - 1][0].should.match(/set response:/);

      Logger.prototype.debug.restore();
      Logger.level = 'warn';
    });
  });
});


function createAgent(o) {
  const app = koa();
  const papp = Object.assign({
    settings: {},
    services: {},
    proto: {},
    addMiddleware: function(fn) {
      const mw = fn();
      app.use(mw);
    }
  }, o);

  app.use(function* (next) {
    if (this.query.module) {
      this.route = {
        module: this.query.module,
        action: this.query.action,
        type: this.query.type
      };
    }
    yield next;
  });

  new NavigateComponent(papp); // eslint-disable-line

  app.use(function* () {
    this.body = this.path;
  });

  return request.agent(app.callback());
}


function stubNavigate() {
  sinon.stub(Navigator.prototype, 'navigate', function* (route) {
    if (route.module === 'notfound') {
      return null;
    }
    if (route.module === 'invalid') {
      return {};    // invalid result
    }

    const data = {
      module: route.module,
      action: route.action
    };
    if (route.type === 'json') {
      return { data: data };
    }
    return { content: JSON.stringify(data) };
  });
}
