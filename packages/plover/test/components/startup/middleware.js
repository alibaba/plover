'use strict';


const pathUtil = require('path');

const request = require('supertest');

const plover = require('../../../');
const plugin = require('../../../lib/components/startup/middleware');


const fixtureRoot = pathUtil.join(__dirname,
        '../../fixtures/components/startup');


describe('components/startup/middleware', function() {
  it('可以载入中间件', function() {
    const p = createApp([
      {
        module: './lib/middlewares/hello.js'
      }
    ]);

    return test(p, '/', 'hello');
  });


  it('使用match路由到中间件', function() {
    const p = createApp([
      {
        module: './lib/middlewares/hello.js',
        match: '/hello'
      }
    ]);

    return Promise.all([
      test(p, '/', 'me'),
      test(p, '/hello', 'hello')
    ]);
  });


  it('指定method进行路由', function() {
    const p = createApp([
      {
        module: './lib/middlewares/hello.js',
        match: '/hello',
        method: 'post'
      }
    ]);

    return Promise.all([
      test(p, '/hello', 'get', 'me'),
      test(p, '/hello', 'post', 'hello')
    ]);
  });


  it('method指定时可以是数组', function() {
    const p = createApp([
      {
        module: './lib/middlewares/hello',
        match: '/hello',
        method: ['put', 'post']
      }
    ]);

    return Promise.all([
      test(p, '/hello', 'get', 'me'),
      test(p, '/hello', 'put', 'hello'),
      test(p, '/hello', 'post', 'hello')
    ]);
  });


  it('可以match到一组中间件', function() {
    const p = createApp([
      {
        modules: [
          './lib/middlewares/a.js',
          pathUtil.join(fixtureRoot, 'lib/middlewares/b.js'),
          pathUtil.join(fixtureRoot, 'lib/middlewares/c.js')
        ],
        match: '/a-b-c'
      }
    ]);

    return test(p, '/a-b-c', 'a & b & c');
  });


  it('兼容原来的middleware属性配置', function() {
    const p = createApp([
      {
        middleware: './lib/middlewares/hello.js'
      }
    ]);

    return test(p, '/hello', 'hello');
  });


  it('没有配置middlewares也不会报错 - for coverage', function() {
    const app = plover({ applicationRoot: fixtureRoot });
    plugin(app);
    app.addMiddleware(function* () {
      this.body = 'hello';
    });
    return request(app.callback())
        .get('/').expect('hello');
  });
});


function createApp(middlewares) {
  const p = plover({
    applicationRoot: fixtureRoot
  });

  p.settings.middlewares = middlewares;

  plugin(p);

  p.addMiddleware(function* () {
    this.body = 'me';
  });

  return p;
}


function test(p, url, method, body) {
  if (arguments.length === 3) {
    body = method;
    method = 'get';
  }

  return new Promise(function(resolve) {
    request(p.callback())[method](url)
      .expect(body)
      .end(resolve);
  });
}

