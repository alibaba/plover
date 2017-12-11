const Koa = require('koa');
const request = require('supertest');
const sinon = require('sinon');
const antsort = require('antsort');

const plover = require('../../');


/* eslint no-console: 0, max-nested-callbacks: [2, 4], consistent-return: 0, require-yield: 0 */


describe('components/core', function() {
  const settings = { applicationRoot: 'somepath' };

  describe('应用启动相关', function() {
    it('可以正常启动plover应用', function() {
      const app = plover(settings);
      app.server.should.be.instanceof(require('koa/lib/application'));
      app.start();
    });


    it('启动时需要等待异步流程初始化完毕才提供服务', function(done) {
      const app = plover(settings);
      const workDone = app.readyCallback('longtime service');
      setTimeout(() => {
        app.mywork = 'done!';
        workDone();
      }, 100);

      (app.mywork === undefined).should.be.true();
      app.start(() => {
        app.mywork.should.equal('done!');
        done();
      });
    });


    it('使用listen可以快速启动应用', function() {
      const app = plover(settings);
      return app.listen(8765);
    });
  });


  describe('app.addMiddleware(middleware, [options])', function() {
    it('添加中间件', async function() {
      const app = plover(settings);

      app.use(async(ctx, next) => {
        if (ctx.url === '/a') {
          ctx.body = 'hello world a';
        } else {
          await next();
        }
      });

      app.use((ctx, next) => {
        if (ctx.url === '/b') {
          ctx.body = 'hello world b';
        } else {
          return next();
        }
      });

      app.use((ctx, next) => {
        if (ctx.url === '/c') {
          ctx.body = 'hello world c';
        } else {
          return next();
        }
      });

      const agent = request(app.callback());
      await agent.get('/a').expect('hello world a');
      await agent.get('/b').expect('hello world b');
      await agent.get('/c').expect('hello world c');
    });


    it('设置中间件级别', function() {
      const app = plover(settings);

      app.addMiddleware(async(ctx, next) => {
        ctx.list = [];
        await next();
        ctx.body = ctx.list.join(' ');
      }, 0);

      app.addMiddleware(function() {
        return (ctx, next) => {
          ctx.list.push('Hello');
          return next();
        };
      }, 2);

      app.addMiddleware(function* (next) {
        this.list.push('Plover');
        yield* next;
      }); // 3 for default

      return request(app.callback())
        .get('/').expect('Hello Plover');
    });


    it('可以使用before精确排序', function() {
      const app = plover(settings);

      app.addMiddleware(function* mycsrf() {
        if (this.ignoreCsrf) {
          this.body = 'ignore csrf';
        } else {
          this.body = 'invalid csrf';
        }
      });

      app.addMiddleware(function* (next) {
        this.ignoreCsrf = true;
        yield* next;
      }, { before: 'mycsrf' });

      return request(app.callback())
        .get('/').expect('ignore csrf');
    });


    it('使用match/method匹配中间件的访问', async function() {
      const app = plover(settings);

      app.addMiddleware(function* () {
        this.body = 'hello';
      }, { match: '/hello/*' });

      app.addMiddleware(function* () {
        this.body = 'uploaded';
      }, { match: '/upload', method: 'post' });

      app.use(async ctx => {
        ctx.body = 'api';
      }, { match: '/api/*' });

      const agent = request.agent(app.callback());

      await agent.get('/').expect(404);
      await agent.get('/hello/123').expect('hello');

      await agent.get('/upload').expect(404);
      await agent.post('/upload').expect('uploaded');

      await agent.get('/api/').expect('api');
      await agent.get('/api/hello').expect('api');
      await agent.get('/api/people/hello').expect('api');
    });
  });


  describe('app.middleware()', function() {
    it('接入到其他koa应用', function() {
      const papp = plover(settings);

      papp.addMiddleware(function* () {
        this.body = 'hello plover';
      });

      const app = new Koa();
      app.use(papp.middleware());

      return request(app.callback())
        .get('/').expect('hello plover');
    });
  });


  describe('扩展Plover', function() {
    it('使用$mountMiddlewares覆盖接入中间件的逻辑', function() {
      const callback = sinon.spy();

      class App extends plover.Application {
        $mountMiddlewares(app, items) {  // eslint-disable-line
          callback();
          items = antsort(items, { defaultLevel: 3 });
          items.forEach(item => {
            app.use(item.module);
          });
        }
      }

      const app = new App(settings);

      app.addMiddleware(function* Hello() {
        this.body = 'hello';
      });

      app.start();
      callback.called.should.be.true();

      return request(app.callback())
        .get('/hello')
        .expect('hello');
    });
  });


  describe('环境相关', function() {
    it('开发环境时，异常会打印在页面上', async function() {
      const app = plover(settings);

      app.addMiddleware(function* () {
        if (this.url === '/admin') {
          this.throw(401);
        } else {
          throw new Error('some error happen');
        }
      });

      sinon.stub(console, 'error');

      const agent = request(app.callback());

      // 500及以上 错误异常会打在页面上
      await agent.get('/').expect(/Error: some error happen/);

      // 其他的正常返回到浏览器端
      await agent.get('/admin').expect(401);

      console.error.restore();
    });
  });
});

