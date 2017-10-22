const http = require('http');
const assert = require('assert');
const antsort = require('antsort');
const pathToRegexp = require('path-to-regexp');
const compose = require('koa-compose');
const util = require('../util/util');

const logger = require('plover-logger')('plover:components/core');


class Core {
  /**
   * 定义核心方法和核心中间件
   * 以及通用异常处理
   *
   * @param {PloverApplication} app - plover应用对象
   */
  constructor(app) {
    this.app = app;

    // 中间件
    this.middlewares = [];

    this.addMiddleware(require('../util/error-handler'), 0);

    // 暴露公共方法
    this.exports = [
      'start',
      'listen',
      'callback',
      'middleware',
      'addMiddleware',
      'use'
    ];
  }


  /**
   * 用于启动应用
   * 1. 初始化所有中间件
   * 2. 注册到koa容器中
   *
   * @param {Function} fn  - [可选] 回调方法，初始化完成时会自动调用此回调
   * @return {Promise}     - 如果`fn`为空，则返回一个Promise对象
   *
   * @since 1.0
   */
  start(fn) {
    const app = this.app;

    if (!this.isStart) {
      this.isStart = true;

      const items = prepareMiddlewares(app, this.middlewares);
      // PloverApplication子类可以实现$mountMiddlewres来介入中间件的组装
      if (app.$mountMiddlewares) {
        app.$mountMiddlewares(app.server, items);
      } else {
        mountMiddlewares(app.server, items);
      }
    }

    // app.ready会判断参数个数，因此不能简写
    return fn ? app.ready(fn) : app.ready();
  }


  /**
   * 方便以中间件方式接入到其他koa应用
   *
   * @return {Middleware} - 中间件
   */
  middleware() {
    this.start();
    return compose(this.app.server.middleware);
  }


  /**
   * 方便快捷启动服务
   *
   * @param {Number} port     - 端口号
   * @param {Number} hostname - hostname
   * @return {Promise}        - promise
   *
   * @since 1.0
   */
  listen(port, hostname) {
    return this.start().then(() => {
      const fn = this.app.server.callback();
      const server = http.createServer(fn);
      return new Promise(resolve => {
        server.listen(port, hostname, null, () => {
          resolve(server);
        });
      });
    });
  }


  /**
   * 方便单元测试等场景
   *
   * @return {function(req, res)} - callback
   *
   * @since 1.0
   */
  callback() {
    this.start();
    return this.app.server.callback();
  }


  /**
   * 添加中间件
   *
   * @param {Function|GenerationFunction} middleware - 中间件
   *  中是间是一个`Function`或`GenerationFunction`
   *  如果是Function，则需要返回一个`GenerationFunction`
   *  如果是Funtion，期望的签名是middleware(config, app, papp)
   *   - config: 配置
   *   - app: koa application对象
   *   - papp: plover实例对象
   *
   * @param {Object|Number} options - 配置，如果是Number则相当于 { level: options }
   *   - prepare  默认情况下如果是function会对中间件先进行一次初始化
   *              如果传了preprae为false，则不作初始化处理
   *              用于支持koa 2普通函数作为中间件
   *   - level    點认为3
   *   - before   用于对中间件进行精确排序
   *   - after
   *   - match
   *   - method
   */
  addMiddleware(middleware, options) {
    assert(typeof middleware === 'function',
      'middleware should be typeof function');

    if (typeof options === 'number') {
      options = { level: options };
    }

    this.middlewares.push({
      middleware: middleware,
      options: options || {}
    });
  }


  use(middleware, options) {
    options = Object.assign({ prepare: false }, options);
    this.addMiddleware(middleware, options);
  }
}


module.exports = Core;


function prepareMiddlewares(app, middlewares) {
  return middlewares.map(item => {
    const options = item.options;
    let mw = util.convertMiddleware(app, item.middleware, options);
    if (options.match || options.method) {
      mw = createProxy(mw, options);
    }

    const o = {
      name: mw.$name || mw.name,
      module: mw,
      before: options.before,
      after: options.after,
      level: options.level
    };

    return o;
  });
}


function mountMiddlewares(server, items) {
  const sorted = antsort(items, { defaultLevel: 3 });
  for (const item of sorted) {
    logger.info('load middleware: %s, level: %s', item.name, item.level);
    server.use(item.module);
  }
}


function createProxy(mw, options) {
  const re = options.match && pathToRegexp(options.match);
  const name = 'proxy-' + options.match +
      '->' + (mw.name || mw.$name);

  logger.info('create proxy middleware: %s -> %s', re, name);

  const result = (ctx, next) => {
    if (!re || re.test(ctx.path)) {
      if (!options.method || match(ctx, options.method)) {
        logger.debug('%s matches %s', ctx.path, name);
        return mw(ctx, next);
      }
    }
    return next();
  };

  result.$name = name;
  return result;
}


/*
 * 验证method是否有效
 */
function match(ctx, method) {
  const m = ctx.method.toLowerCase();
  if (typeof method === 'string') {
    return method === m;
  }
  // for Array
  return method.indexOf(m) !== -1;
}

