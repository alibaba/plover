'use strict';


const Koa = require('koa');
const request = require('supertest');

describe('plover-web/web/params', () => {
  it('ctx.params', () => {
    const app = new Koa();
    require('../../lib/web/params')(app);
    app.use(require('koa-bodyparser')());
    app.use(ctx => {
      const params = ctx.params;
      params.should.equal(ctx.params); // cached
      ctx.body = ctx.params;
    });

    return request(app.callback())
        .post('/?page=23')
        .send({ name: 'plover' })
        .expect({ page: '23', name: 'plover' });
  });
});

