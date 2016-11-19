'use strict';


const koa = require('koa');
const request = require('supertest');
const co = require('co');
const assertMethod = require('../../lib/security/assert-method');


describe('plover-web/security/assert-method', () => {
  const app = koa();
  assertMethod(app);

  app.use(function* () {
    if (this.path === '/post') {
      this.assertMethod('post');
    }
    if (this.path === '/get') {
      this.assertMethod(['get']);
    }
    this.body = 'ok';
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

