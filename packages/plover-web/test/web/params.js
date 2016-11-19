'use strict';


const koa = require('koa');
const request = require('supertest');

describe('plover-web/web/params', () => {
  it('this.params', () => {
    const app = koa();
    require('../../lib/web/params')(app);
    app.use(require('koa-bodyparser')());
    app.use(function* () {
      const params = this.params;
      params.should.equal(this.params); // cached
      this.body = this.params;
    });

    return request(app.callback())
        .post('/?page=23')
        .send({ name: 'plover' })
        .expect({ page: '23', name: 'plover' });
  });
});

