'use strict';


const pathUtil = require('path');
const co = require('co');
const plover = require('plover');
const request = require('supertest');
const Engine = require('plover-arttemplate');


const plugin = require('../lib/plugin');

const sleep = require('./fixtures/app/lib/sleep');


/* eslint no-process-env: 0 */



describe('plugin', function() {
  const root = pathUtil.join(__dirname, 'fixtures/app');

  it('run with benchmark', function() {
    const settings = {
      applicationRoot: root,
      benchmark: {
        enable: true
      }
    };

    const app = create(settings);
    app.addMiddleware(CacheService);

    return request(app.callback())
      .get('/').expect(200);
  });


  it('run without benchmark for default', function() {
    const app = create({ applicationRoot: root });
    app.addMiddleware(CacheService);

    return request(app.callback())
      .get('/').expect(200);
  });


  it('ignore for simple request', function() {
    const app = create({
      applicationRoot: root,
      benchmark: { enable: true }
    });
    app.addMiddleware(function* () {
      this.body = 'simple';
    });
    return request(app.callback())
      .get('/').expect(200);
  });


  it('enable with env DEBUG_BENCHMARK', function() {
    process.env.DEBUG_BENCHMARK = '1';
    const app = create({ applicationRoot: root });
    app.addMiddleware(CacheService);
    return co(function* () {
      yield request(app.callback())
        .get('/').expect(200);
      delete process.env.DEBUG_BENCHMARK;
    });
  });
});


function* CacheService(next) {
  const done = this.benchmark.mark('cache-service');
  yield sleep(60);
  done();
  yield* next;
}


function create(settings) {
  const app = plover(settings);
  plugin(app);
  const engine = new Engine();
  app.addEngine('art', engine);
  return app;
}
