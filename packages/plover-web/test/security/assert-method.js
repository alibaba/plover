'use strict';


const Koa = require('koa');
const request = require('supertest');
const co = require('co');
const assertMethod = require('../../lib/security/assert-method');


describe('plover-web/security/assert-method', () => {
  const app = new Koa();
  assertMethod(app);

  app.use(ctx => {
    if (ctx.path === '/post') {
      ctx.assertMethod('post');
    }
    if (ctx.path === '/get') {
      ctx.assertMethod(['get']);
    }
    ctx.body = 'ok';
  });

  const agent = request.agent(app.callback());

  it('test', () => {
    return co(function* () {
      yield agent.get('/get').expect('ok');
      yield agent.post('/get')
        .expect(401, 'invalid request method, expect: get, actual: POST');

      yield agent.post('/post').expect('ok');
      yield agent.get('/post').expect(401);
    });
  });
});

