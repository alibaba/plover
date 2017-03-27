'use strict';


const Koa = require('koa');
const request = require('supertest');
const co = require('co');
const charset = require('../../lib/web/charset');


/* eslint max-nested-callbacks: [2, 4] */


describe('plover-web/web/charset', () => {
  it('output gbk with query _output_charset', () => {
    const app = new Koa();
    app.use(charset());
    app.use(ctx => {
      if (ctx.path === '/a') {
        ctx.body = '中国';
      } else if (ctx.path === '/b') {
        ctx.body = { data: '中国' };
      }
    });

    const agent = request.agent(app.callback());
    return co(function* () {
      yield agent.get('/a').expect('中国');

      yield agent.get('/a?_output_charset=gbk')
          .expect('content-type', 'text/plain; charset=gbk')
          .expect(o => {
            o.buffered.should.be.true();
          });

      // json data should not encode
      yield agent.get('/b?_output_charset=gbk')
          .expect({ data: '中国' });
    });
  });
});
