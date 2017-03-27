'use strict';


const mm = require('plover-test-mate');
const co = require('co');


describe('plover-route/lib/plugin', () => {
  it('config routes', () => {
    const app = mm({
      applicationRoot: __dirname,
      routes: (r) => {
        r.get('/profile', 'users#show');
        r.use('/hello', ctx => {
          ctx.body = 'hello';
        });
      }
    });

    app.use('plover-web');
    app.use(require('../lib/plugin'));

    app.addMiddleware(ctx => {
      if (ctx.route) {
        ctx.body = ctx.route;
      }
    }, { bare: true });

    return co(function* () {
      yield app.get('/profile').expect({
        module: 'users',
        action: 'show',
        query: {}
      });

      yield app.get('/hello').expect('hello');
    });
  });


  it('routes not config', () => {
    const app = mm({
      applicationRoot: __dirname
    });

    app.use('plover-web');
    app.use(require('../lib/plugin'));

    (true).should.be.ok();
  });


  it('put with _method', () => {
    const app = mm({
      applicationRoot: __dirname,
      web: {
        csrf: {
          ignore: ['/*']
        }
      }
    });

    app.use('plover-web');
    app.use(require('../lib/plugin'));

    app.addMiddleware(ctx => {
      ctx.body = ctx.method;
    }, { bare: true });

    return co(function* () {
      yield app.agent.post('/update')
        .send({ _method: 'put' })
        .expect('PUT');
    });
  });
});
