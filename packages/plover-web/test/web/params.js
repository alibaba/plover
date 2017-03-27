'use strict';


const Koa = require('koa');
const request = require('supertest');

describe('plover-web/web/params', () => {
  it('this.params', () => {
    const app = new Koa();
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

