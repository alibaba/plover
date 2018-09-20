const pathUtil = require('path');
const request = require('supertest');
const plover = require('plover');

const plugin = require('../lib/plugin');


describe('plover-web/plugin', function() {
  const root = pathUtil.join(__dirname, './fixtures/app');
  const settings = require(pathUtil.join(root, 'config/app.js'));
  const app = plover(settings);

  plugin(app);
  hello(app);
  login(app);

  const agent = request.agent(app.callback());

  it('etag and rtime', () => {
    return agent.get('/hello')
      .expect(function(res) {
        res.header.etag.should.not.empty();
        res.header['x-response-time'].should.not.empty();
      })
      .expect('hello');
  });


  it('favicon', () => {
    return agent.get('/favicon.ico').expect(200);
  });


  it('static', () => {
    return agent.get('/ok.txt').expect('ok!\n');
  });


  it('compress', () => {
    return agent.get('/big.txt')
      .expect('Content-Encoding', 'gzip');
  });


  it('not setting.web', () => {
    const myapp = plover({ applicationRoot: __dirname });
    plugin(myapp);
    hello(myapp);
    return request(myapp.callback())
      .get('/hello').expect('hello');
  });


  it('security headers', () => {
    return agent.get('/hello')
      .expect('X-XSS-Protection', '1; mode=block')
      .expect('X-Content-Type-Options', 'nosniff')
      .expect('X-Download-Options', 'noopen');
  });


  it('session', async() => {
    await agent.get('/login').expect('ok');
    await agent.get('/user').expect({ name: 'tester' });
  });


  it('cors', async() => {
    await agent.get('/hello')
      .set('Host', 'www.google.com')
      .set('Origin', 'http://www.google.com:8080')
      .expect('hello')
      .expect('access-control-allow-origin', 'http://www.google.com:8080');

    const res = await agent.get('/hello')
      .set('Origin', 'http://www.google.com:8080');

    res.text.should.equal('hello');
    (res.headers['access-control-allow-origin'] === undefined).should.ok();
  });
});


function hello(app) {
  app.use(async(ctx, next) => {
    if (ctx.path === '/hello') {
      ctx.body = 'hello';
    } else {
      await next();
    }
  });
}


function login(app) {
  app.use(async(ctx, next) => {
    if (ctx.path === '/login') {
      ctx.session.user = { name: 'tester' };
      ctx.body = 'ok';
    } else if (ctx.path === '/user') {
      ctx.body = ctx.session.user;
    } else {
      await next();
    }
  });
}
