const co = require('co');
const Koa = require('koa');
const sinon = require('sinon');
const request = require('supertest');
const jsonp = require('jsonp-body');

const Logger = require('plover-logger');

const NavigateComponent = require('../../lib/components/navigate');
const Navigator = require('../../lib/core/navigator');

/* eslint require-yield: 0 */

describe('components/navigate', function() {
  before(function() {
    stubNavigate();
  });

  after(function() {
    Navigator.prototype.navigate.restore();
  });


  it('addEngine(ext, engine)', function() {
    const app = mockApp();
    const nav = new NavigateComponent(app);

    const engine = { compile: () => {} };
    nav.addEngine('art', engine);
    app.engines.art.should.equal(engine);
  });


  it('addHelper(name, helper)', function() {
    const app = mockApp();
    const nav = new NavigateComponent(app);

    const engine = { compile: () => {} };
    nav.addEngine('art', engine);
    app.engines.art.should.equal(engine);

    const AssetsHelper = { startup: sinon.spy() };
    nav.addHelper('assets', AssetsHelper);

    AssetsHelper.startup.called.should.be.true();
    AssetsHelper.startup.args[0][0].should.be.equal(app.proto);

    app.helpers.assets.should.equal(AssetsHelper);
  });


  it('addFilter(filter, options)', function() {
    const app = mockApp();
    const nav = new NavigateComponent(app);

    const DefaultFilter = { $name: 'DefaultFilter' };
    nav.addFilter(DefaultFilter);

    const TestFilter = { $name: 'TestFilter' };
    nav.addFilter(TestFilter, 2);

    const XViewFilter = { $name: 'XViewFilter' };
    nav.addFilter(XViewFilter, { match: '/api' });

    const MediaFilter = { $name: 'MediaFilter' };
    nav.addFilter(MediaFilter, { before: 'TestFilter' });

    // prepare filter
    app.start();

    app.filters[0].should.eql({
      name: 'MediaFilter',
      filter: MediaFilter,
      match: null,
      options: {
        before: 'TestFilter'
      }
    });

    app.filters[1].should.eql({
      name: 'TestFilter',
      filter: TestFilter,
      match: null,
      options: {
        level: 2
      }
    });

    app.filters[2].should.eql({
      name: 'DefaultFilter',
      filter: DefaultFilter,
      match: null,
      options: {}
    });

    app.filters[3].should.eql({
      name: 'XViewFilter',
      filter: XViewFilter,
      match: /^\/api(?:\/)?$/i,
      options: {
        match: '/api'
      }
    });
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


function mockApp() {
  const app = new Koa();
  const mws = [];
  return {
    settings: {},
    services: {},
    proto: {},
    addMiddleware: function(fn) {
      mws.push(fn);
    },
    start: function() {
      mws.forEach(fn => app.use(fn()));
    },
    server: app
  };
}


function createAgent(o) {
  const papp = Object.assign(mockApp(), o);
  const app = papp.server;

  app.use((ctx, next) => {
    if (ctx.query.module) {
      ctx.route = {
        module: ctx.query.module,
        action: ctx.query.action,
        type: ctx.query.type
      };
    }
    return next();
  });

  new NavigateComponent(papp); // eslint-disable-line
  papp.start();

  app.use(ctx => {
    ctx.body = ctx.path;
  });

  return request.agent(app.callback());
}


function stubNavigate() {
  sinon.stub(Navigator.prototype, 'navigate').callsFake(function* (route) {
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
