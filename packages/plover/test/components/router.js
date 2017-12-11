const co = require('co');
const sinon = require('sinon');
const supertest = require('supertest');
const plover = require('../../');

/* eslint require-yield: 0 */

describe('components/router', function() {
  const settings = { applicationRoot: 'somepath' };


  it('使用默认路由规则', function() {
    const app = plover(settings);

    app.addMiddleware(function* () {
      this.route.should.eql({
        module: 'test',
        action: 'update',
        query: {}
      });
    });

    return request(app, '/test/update');
  });


  it('app.addRoute(pattern, to)－添加路由规则', function() {
    const app = plover(settings);

    app.addRoute('/my-hello', 'my/hello');

    app.addMiddleware(function* () {
      this.route.should.eql({
        module: 'my',
        action: 'hello',
        query: {}
      });
    });

    return request(app, '/my-hello');
  });


  it('前置中间件可以完成特殊路由', function() {
    const app = plover(settings);

    app.addMiddleware(function* (next) {
      if (this.url === '/a.xml') {
        this.route = {
          module: 'xml',
          action: 'view',
          query: { name: 'a' }
        };
      }
      yield* next;
    }, 1);

    app.addMiddleware(function* () {
      // special route
      if (this.url === '/a.xml') {
        this.route.module.should.equal('xml');
      }
      // default route
      if (this.url === '/index') {
        this.route.module.should.equal('index');
      }
    });

    return Promise.all([
      request(app, '/index'),
      request(app, '/a.xml')
    ]);
  });


  it('可以通过设置disableDefaultRouter关闭默认路由', function() {
    const app = plover({
      applicationRoot: 'somedir',
      disableDefaultRouter: true
    });

    app.addMiddleware(function* () {
      (this.route === null).should.be.ok();
    });

    return request(app, '/index');
  });


  it('多次访问同一个url, route会cache', function() {
    const app = plover(settings);

    // 不存在的模块，RouteCache不会进行缓存
    // 所以这里先添加一个
    app.moduleResolver.pushModule({
      name: 'index',
      reload: false,
      views: []
    });

    const Router = require('../../lib/util/router');
    sinon.spy(Router.prototype, 'route');

    return co(function* () {
      Router.prototype.route.called.should.be.false();

      yield request(app, '/index');
      const count = Router.prototype.route.callCount;
      (count > 0).should.be.true();

      yield request(app, '/index');

      Router.prototype.route.callCount.should.equal(count);

      // restore
      Router.prototype.route.restore();
    });
  });
});


function request(app, url) {
  return new Promise(resolve => {
    supertest(app.callback())
      .get(url)
      .end(resolve);
  });
}

