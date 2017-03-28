const pathUtil = require('path');
const Koa = require('koa');
const request = require('supertest');

const plover = require('..');
const Logger = require('plover-logger');


/* eslint no-process-env: 0 */


describe('application', function() {
  const root = pathUtil.join(__dirname, 'fixtures/index');
  const configRoot = pathUtil.join(root, 'config');


  it('可以使用plover()构造应用', function() {
    const app = plover({ applicationRoot: root });
    app.server.should.be.instanceof(require('koa/lib/application'));

    // koa app和koa context可以取得moduleResolver
    app.context.moduleResolver.should.equal(app.moduleResolver);
    app.server.moduleResolver.should.equal(app.moduleResolver);
  });


  it('可以通过app.settings取得应用配置配置', function() {
    const settings = { applicationRoot: root };
    const app = plover(settings);
    app.settings.applicationRoot.should.equal(root);

    // 中间件上下文可以取得settings对象
    app.context.settings.should.equal(app.settings);
  });


  it('可以指定configRoot来读取业务配置', function() {
    const app = plover({
      applicationRoot: root,
      configRoot: configRoot
    });

    app.config.plover.should
        .equal(require(pathUtil.join(configRoot, 'plover')));

    app.config.urls.should
        .equal(require(pathUtil.join(configRoot, 'urls')));

    // 中间件上下文中可以取得config对象
    app.context.config.should.equal(app.config);
  });


  it('settings配置会覆盖config中相同的配置', function() {
    const app = plover({
      applicationRoot: root,
      configRoot: configRoot,
      urls: []
    });

    app.config.plover.should
        .equal(require(pathUtil.join(configRoot, 'plover')));

    app.config.urls.should.eql([]);
  });


  it('可以通过配置设置日志级别', function() {
    plover({ applicationRoot: root, logger: { level: 'info' } });
    Logger.level.should.equal('info');
  });


  it('可以集成到原有koa应用', function() {
    const app = new Koa();
    const papp = plover(app, {
      applicationRoot: root
    });

    papp.server.should.be.equal(app);
  });


  it('集成到其它koa应用时, 如果存在自定义config，则不会被覆盖', function() {
    const app = new Koa();
    const config = {};
    app.context.config = config;

    const papp = plover(app, {
      applicationRoot: root,
      configRoot: configRoot
    });

    papp.context.config.should.equal(config);
  });


  it('可以通过app.context扩展koa对象', function() {
    const p = plover({ applicationRoot: root });

    p.context.sayHello = function() {
      return 'hello';
    };

    const app = p.server;
    app.use(ctx => {
      ctx.body = ctx.sayHello();
    });

    return request(app.callback()).get('/').expect('hello');
  });


  it('设置DEBUG环境变量会调整日志级别为debug', function() {
    process.env.DEBUG = 'plover*';
    plover({ applicationRoot: root });
    Logger.level.should.equal('debug');
    delete process.env.DEBUG;
  });


  it('可以通过LOG_LEVEL来设置日志级别', function() {
    process.env.LOG_LEVEL = 'info';
    plover({ applicationRoot: root });
    Logger.level.should.equal('info');
    delete process.env.LOG_LEVEL;
  });


  it('模块依赖如果不兼容会报错的', function(done) {
    const path = pathUtil.join(__dirname, 'fixtures/index-dep');
    const app = plover({ applicationRoot: path });

    app.on('error', function(e) {
      e.message.should.be.match(
        'b@2.0.0 is not compatible with a which depend on b@~1.0.0');
      done();
    });
  });


  it('plover核心可以由Components自由组织', function() {
    class Core {
      constructor(app) {
        this.server = app.server;
        this.exports = ['callback', 'addMiddleware'];
      }

      callback() {
        return this.server.callback();
      }

      addMiddleware(mw) {
        this.server.use(mw);
      }
    }

    class Plugin {
    }

    class MyPlover extends plover.Application {
      $prepareComponents() {
        return [Core, Plugin];
      }
    }

    const app = new MyPlover({ applicationRoot: root });

    app.addMiddleware(ctx => {
      ctx.body = 'hello world';
    });

    return request(app.callback())
        .get('/')
        .expect('hello world');
  });


  it('application启动后会输出模块列表日志(for coverage)', function(done) {
    const path = pathUtil.join(__dirname, 'fixtures/index-mods');
    plover({ applicationRoot: path, env: 'test' });  // 测试环境不打印
    plover({ applicationRoot: path, __testPrintModules: true }); // 会打印出模块列表
    setTimeout(done, 10);
  });
});
