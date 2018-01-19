const mm = require('plover-test-mate');


describe('plover-route/lib/plugin', () => {
  it('config routes', async() => {
    const app = create({
      applicationRoot: __dirname,
      routes: r => {
        r.get('/profile', 'users#show');
        r.use('/hello', ctx => {
          ctx.body = 'hello';
        });
      }
    });

    app.use(ctx => {
      if (ctx.route) {
        ctx.body = ctx.route;
      }
    });

    await app.get('/profile').expect({
      module: 'users',
      action: 'show',
      query: {}
    });

    await app.get('/hello').expect('hello');
  });


  it('routes with namespace', async() => {
    const app = create({
      applicationRoot: __dirname,
      disableDefaultRouter: true,
      routes: r => {
        r.namespace('/users', () => {
          r.use(async(ctx, next) => {
            await next();
            if (ctx.route) {
              ctx.body = ctx.route.url;
            } else {
              ctx.body = ctx.path;
            }
          });

          r.get('config', 'users#config');
        });
      },
    });

    await app.get('/users/config').expect('users:config');
    await app.get('/users/messages').expect('/users/messages');
    await app.get('/users/').expect('/users/');
    await app.get('/users').expect(404);
  });


  it('routes not config', () => {
    const app = create({
      applicationRoot: __dirname
    });

    (true).should.be.ok();
  });


  describe('http method', () => {
    const app = create({
      applicationRoot: __dirname,
      web: {
        csrf: {
          ignore: ['/*']
        }
      }
    });

    app.use(ctx => {
      ctx.body = ctx.method;
    });


    it('put with _method', async() => {
      await app.agent.post('/update')
        .send({ _method: 'put' })
        .expect('PUT');
    });


    it('patch with header: x-http-method-override', async() => {
      await app.agent.post('/update')
        .set('X-HTTP-Method-Override', 'patch')
        .expect('PATCH');
    });
  });
});


function create(opts) {
  const app = mm(opts);
  app.install('plover-web');
  app.install(require('../lib/plugin'));
  return app;
}
