const Koa = require('koa');
const request = require('supertest');
const co = require('co');


describe('plover-web/web/flash', function() {
  it('test', function() {
    const app = new Koa();

    app.keys = ['0627e'];

    app.use(require('koa-session')({}, app));
    app.use(require('../../lib/web/flash')(app));

    app.use(ctx => {
      if (ctx.path === '/update') {
        ctx.flash.errors = {
          message: 'some error happen'
        };
        ctx.redirect('/save');
      } else if (ctx.path === '/save') {
        ctx.body = ctx.flash.errors;
      } else {
        ctx.body = 'hello';
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
