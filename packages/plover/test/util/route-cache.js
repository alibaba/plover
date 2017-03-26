'use strict';


const RouteCache = require('../../lib/util/route-cache');


describe('util/route-cache', function() {
  const moduleList = ['index', 'offer'];

  const moduleResolver = {
    resolve: function(name) {
      return moduleList.indexOf(name) !== -1;
    }
  };

  const routeCache = new RouteCache({
    moduleResolver: moduleResolver,
    settings: {}
  });


  it('使用route-cache存取路由', function() {
    routeCache.set('/index', { module: 'index', action: 'view' });
    const cache = routeCache.get('/index');
    cache.should.eql({ module: 'index', action: 'view', query: {} });
  });


  it('同一module/action路由太多次，会让cache失败', function() {
    const size = 30;

    for (let i = 0; i < size; i++) {
      const route = { module: 'offer', action: 'view', query: { id: i } };
      routeCache.set('/offer/' + i, route);
    }

    for (let i = 0; i < size; i++) {
      routeCache.get('/offer/' + i).should
        .eql({ module: 'offer', action: 'view', query: { id: i } });
    }

    // 第30个, 会清除原有offer/view的cache
    const success = routeCache.set('/offer/29',
        { module: 'offer', action: 'view' });
    success.should.be.false();

    for (let i = 0; i < size; i++) {
      (routeCache.get('/offer/' + i) === undefined).should.be.true();
    }
  });


  it('不存在的模块不route', function() {
    routeCache.set('/404', { module: 'not-found', action: 'view' })
        .should.be.false();

    (routeCache.get('/404') === undefined).should.be.true();
  });

  /*
  it('默认情况下，路由是有cache的', function() {
    const app = plover({
      applicationRoot: root,
      disableDefaultRouter: true
    });

    app.addRoute('/test', 'test/view');

    const callback = sinon.spy();
    app.addMiddleware(function* () {
      callback();
    });

    const agent = request(app.callback());

    return co(function* () {
      yield agent.get('/test');
      yield agent.get('/test');

      const cacheSpy = RouteCache.prototype.get;
      (cacheSpy.firstCall.returnValue === undefined).should.be.ok();
      cacheSpy.secondCall.returnValue.should.eql({
        module: 'test',
        action: 'view',
        query: {}
      });

      // 路由只进行了一次
      Router.prototype.route.calledOnce.should.be.true();

      // 中间件访问了两次
      callback.calledTwice.should.be.true();
    });
  });


  it('cache数目超过指定数量会失效', function() {
    const app = plover({
      applicationRoot: root,
      disableDefaultRouter: true,
      maxRouteCacheSize: 2
    });

    app.addRoute('/test/:page', 'test/view');

    const agent = request(app.callback());

    const cacheSpy = RouteCache.prototype.get;

    return co(function* () {
      yield agent.get('/test/1');
      yield agent.get('/test/1');   // cached

      cacheSpy.getCall(1).returnValue.should.not.empty();

      yield agent.get('/test/2');
      yield agent.get('/test/2');   // cached

      (cacheSpy.getCall(2).returnValue === undefined).should.be.ok();
      cacheSpy.getCall(3).returnValue.should.not.empty();

      yield agent.get('/test/4');   // clean cache
      yield agent.get('/test/1');   // nocache

      (cacheSpy.getCall(5).returnValue === undefined).should.be.ok();

      Router.prototype.route.callCount.should.equal(4);
    });
  });


  it('清除cache是以action为维度的', function() {
    const app = plover({
      applicationRoot: root,
      disableDefaultRouter: true,
      maxRouteCacheSize: 2
    });

    app.addRoute('/test/:page', 'test/view');
    app.addRoute('/test/update', 'test/update');
    app.addRoute('/', 'index/view');

    const agent = request(app.callback());

    return co(function* () {
      yield agent.get('/test/update');
      yield agent.get('/test/update');

      yield agent.get('/');
      yield agent.get('/');

      yield agent.get('/test/1');
      yield agent.get('/test/2');
      yield agent.get('/test/3');

      const cacheSpy = RouteCache.prototype.get;
      // test/update还是有cache的
      cacheSpy.getCall(1).returnValue.should.not.empty();

      cacheSpy.getCall(3).returnValue.should.not.empty();

      // test/:page 就不再cache了
      (cacheSpy.getCall(6).returnValue === undefined).should.ok();
    });
  });

  */
});

