'use strict';


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

  const agent = request.agent(app.callback());

  it('etag and rtime', function() {
    return agent.get('/hello')
      .expect(function(res) {
        res.header.etag.should.not.empty();
        res.header['x-response-time'].should.not.empty();
      })
      .expect('hello');
  });


  it('favicon', function() {
    return agent.get('/favicon.ico').expect(200);
  });


  it('static', function() {
    return agent.get('/ok.txt').expect('ok!\n');
  });


  it('compress', function() {
    return agent.get('/big.txt')
        .expect('Content-Encoding', 'gzip');
  });


  it('not setting.web', function() {
    const myapp = plover({ applicationRoot: __dirname });
    plugin(myapp);
    hello(myapp);
    return request(myapp.callback())
      .get('/hello').expect('hello');
  });


  it('security headers', function() {
    return agent.get('/hello')
      .expect('X-XSS-Protection', '1; mode=block')
      .expect('X-Content-Type-Options', 'nosniff')
      .expect('X-Download-Options', 'noopen');
  });
});


function hello(app) {
  app.addMiddleware(function* (next) {
    if (this.path === '/hello') {
      this.body = 'hello';
    } else {
      yield* next;
    }
  });
}
