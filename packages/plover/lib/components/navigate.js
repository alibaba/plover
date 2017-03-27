'use strict';


const assert = require('assert');
const jsonp = require('jsonp-body');
const antsort = require('antsort');
const pathToRegexp = require('path-to-regexp');
const co = require('co');

const RouteInfo = require('plover-util/lib/route-info');

const Navigator = require('../core/navigator');
const ActionContext = require('../core/action-context');
const HelperContainer = require('../core/helper-container');

const logger = require('plover-logger')('plover:components/navigate');


class Navigate {

  /**
   * 页面渲染流程
   *
   * 1. 处理页面渲染流程
   * 2. 暴露和渲染相关的公共方法
   *
   * @param {PloverApplication} app - plover应用对象
   */
  constructor(app) {
    this.app = app;

    app.engines = {};
    app.helpers = {};
    app.filters = [];

    app.addMiddleware(require('../util/error-handler'), 4);
    app.addMiddleware(createNavigateComponent(this), 4);

    // 默认添加app帮助对象
    // 主要用于提供渲染相关的帮助方法
    this.addHelper('app', require('../helpers/app'));

    this.exports = [
      'addEngine',
      'addHelper',
      'addFilter'
    ];
  }


  /**
   * 添加渲染引擎
   *
   * @param {String}  ext     - 扩展名
   * @param {Object}  engine  - 模板引擎
   */
  addEngine(ext, engine) {
    assert(typeof engine.compile === 'function',
        'render engine should be have a `compile` function');
    logger.info('register engine: %s', ext);
    this.app.engines[ext] = engine;
  }


  /**
   * 添加模板帮助方法
   *
   * @param {String}    name   - 名称
   * @param {Function}  helper - Helper实例
   */
  addHelper(name, helper) {
    const app = this.app;
    app.helpers[name] = helper;
    if (typeof helper.startup === 'function') {
      helper.startup(app.proto);
    }
  }


  /**
   * 添加渲染拦截器
   *
   * @param {Object}         filter   - 拦截器
   * @param {Object|Number}  options  - 如果是Number则相当于{ level: options }
   *  - level  默认为3
   *  - before 用于对filter进行精确排序
   *  - after
   *  - match
   */
  addFilter(filter, options) {
    if (typeof options === 'number') {
      options = { level: options };
    }
    this.app.filters.push({
      name: filter.$name,
      filter: filter,
      options: options || {}
    });
  }
}


module.exports = Navigate;


/*
 * 此中间件处理渲染主流程
 * 主要交由Navigate对象完成
 * 每个请求对应于一个Navigate对象
 */
function createNavigateComponent(self) {
  // 返回function是因为需要等插件全部初始化
  return function() {
    const app = self.app;
    HelperContainer.refine(app);
    ActionContext.refine(app);

    app.filters = prepareFilters(app.filters);

    return async function NavigateComponent(ctx, next) {
      if (!ctx.route) {
        await next();
        return;
      }

      const route = RouteInfo.regular(ctx.route);
      route.root = route;
      route.parent = null;

      const navigator = new Navigator(self.app, ctx);
      const result = await co(navigator.navigate(route));
      if (result) {
        setResponse(self.app, ctx, result);
      }
    };
  };
}


function prepareFilters(filters) {
  const list = antsort(filters.map((item, index) => {
    return Object.assign({ index: index, name: item.name }, item.options);
  }), { defaultLevel: 3 });

  const result = [];
  list.forEach(item => {
    const o = filters[item.index];
    const match = o.options.match;
    o.match = match ? pathToRegexp(match) : null;
    result.push(o);
  });
  return result;
}


/*
 * @param {Object} result
 *  - body  输出为字符串(html, xml等)
 *  - data  输出为json/jsonp
 */
function setResponse(app, ctx, result) {
  if (result.content !== undefined) {
    logResult(result.content);
    ctx.body = result.content;
  } else if (result.data) {
    logResult(result.data);
    if (app.$jsonp) {
      app.$jsonp(ctx, result.data);
    } else {
      setJsonResponse(ctx, result.data);
    }
  } else {
    logger.error('invalid navigate result: %o', result);
    throw new Error('invalid navigate result');
  }
}


function logResult(data) {
  if (!logger.isEnabled('debug')) {
    return;
  }

  if (typeof data === 'object') {
    data = JSON.stringify(data);
  }

  logger.debug('set response: \n%s\n...',
      data.substr(0, 1000));
}


/*
 * json/jsonp输出
 */
function setJsonResponse(ctx, data) {
  const callback = ctx.query.callback;

  ctx.set('X-Content-Type-Options', 'nosniff');
  if (callback) {
    ctx.set('Content-Type', 'text/javascript');
  } else {
    ctx.set('Content-Type', 'application/json');
  }

  ctx.body = jsonp(data, callback);
}

