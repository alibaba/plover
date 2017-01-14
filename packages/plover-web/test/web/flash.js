'use strict';


const koa = require('koa');
const request = require('supertest');
const co = require('co');


describe('plover-web/web/flash', function() {
  it('test', function() {
    const app = koa();

    app.keys = ['0627e'];

    app.use(require('koa-session')({}, app));
    app.use(require('../../lib/web/flash')(app));

    app.use(function* () {
      if (this.path === '/update') {
        this.flash.errors = {
          message: 'some error happen'
        };
        this.redirect('/save');
      } else if (this.path === '/save') {
        this.body = this.flash.errors;
      } else {
        this.body = 'hello';
      }
    });

    const agent = request.agent(app.callback());
    return co(function* () {
      yield agent.get('/update').expect(302);
      yield agent.get('/save').expect({ message: 'some error happen' });

      yield agent.get('/hello').expect('hello');
    });
  });
});
