const pathUtil = require('path');
const co = require('co');
const fs = require('fs-extra');
const mm = require('plover-test-mate');

const util = require('../lib/util/util');
const middleware = require('../lib/middleware');
const handler = require('../lib/handler');


describe('middleware', function() {
  const root = pathUtil.join(__dirname, './fixtures/app');
  const app = mm({ applicationRoot: root });

  app.addMiddleware(middleware);
  app.use(ctx => {
    ctx.body = 'ok';
  });

  handler.add('css', '.less', LessHandler);

  before(function() {
    fs.emptyDirSync(pathUtil.join(root, 'tmp'));
  });


  it('should yield next if not an assets request', function() {
    return app.get('/hello').expect('ok');
  });


  it('module assets', function() {
    return app.get('/g/index/css/view.css')
        .expect('body { }\n');
  });


  it('module assets with handler', function() {
    return app.get('/g/index/css/test.css')
        .expect('compiled: body: {}\n');
  });


  it('module assets not exists', function() {
    return app.get('/g/index/css/not-exists.css')
        .expect(404);
  });


  it('concat assets', function() {
    return app.get('/g/??index.html,index/js/a.js,index/js/b.js,index/css/test.css,not-found.js')   // eslint-disable-line
        .expect('Hello World\n\nvar a = 1;\n\nvar b = 2;\n\ncompiled: body: {}\n\n');
  });


  const myapp = mm({ applicationRoot: root, env: 'production' });
  myapp.addMiddleware(middleware);

  it('should with cache when run in no dev mode', function() {
    return co(function* () {
      const url = '/g/index/css/test.css';
      const cachePath = util.getCachePath(url, myapp.settings);
      fs.existsSync(cachePath).should.not.true();
      const expect = 'compiled: body: {}\n';

      yield myapp.get(url).expect(expect);

      fs.existsSync(cachePath).should.be.true();

      yield myapp.get(url).expect(expect);
    });
  });


  it('direct access /public file when run in no dev mode', function() {
    return myapp.get('/g/index.html').expect('Hello World\n');
  });


  it('module not found', function() {
    return app.get('/g/not-exists/js/view.js')
      .expect(404);
  });


  it('invalid module assets url', function() {
    return app.get('/g/abc.js')
      .expect(404);
  });
});


function LessHandler(path, source) {
  return 'compiled: ' + source;
}

