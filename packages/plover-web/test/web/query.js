'use strict';


const Koa = require('koa');
const request = require('supertest');
const parseQuery = require('../../lib/web/query');


describe('plover-web/web/query', function() {
  const app = new Koa();
  parseQuery(app);
  app.use(function* () {
    this.body = this.query;
  });
  const agent = request.agent(app.callback());

  const tests = {
    'a=1&b=2': { a: '1', b: '2' },
    'a=1&a=2': { a: '2' },
    'a[]=1&a[]=2': { a: ['1', '2'] },
    'a[2]=1&a[1]=2&a[0]=100': { a: ['100', '2', '1'] },
    'a.a=1&a.b=2': { a: { a: '1', b: '2' } }
  };

  Object.keys(tests).forEach(key => {
    const value = tests[key];
    it(key, () => {
      return agent.get('/?' + key).expect(value);
    });
  });


  it('should cached when call `this.query` multiple times', function() {
    const myapp = new Koa();
    parseQuery(myapp);
    myapp.use(function* () {
      (this.query === this.query).should.be.true();
      this.body = 'ok';
    });
    return request(myapp.callback())
      .get('/').expect('ok');
  });
});
