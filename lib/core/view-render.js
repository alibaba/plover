'use strict';


const assert = require('assert');
const pathUtil = require('path');
const fs = require('mz/fs');
const yieldCache = require('yield-cache');

const is = require('is-type-of');
const assign = require('plover-util/lib/assign');
const RouteInfo = require('plover-util/lib/route-info');

const invoker = require('../util/invoker');
const RenderHelper = require('./render-helper');
const HelperContainer = require('./helper-container');


const logger = require('plover-logger')('plover:core/view-render');


class ViewRender {

  /**
   * 用于执行视图渲染
   * 一个ViewRender对应于一次请求
   *
   * @param {PloverApplication} app - Plover应用对象
   * @param {Navigator} navigator   - Navigator对象
   */
  constructor(app, navigator) {
    this.app = app;
    this.navigator = navigator;

    this.moduleResolver = app.moduleResolver;
    this.development = app.settings.development;

    this.engines = app.engines;
    this.helpers = app.helpers;
    this.filters = navigator.filters;

    // 前端资源配置
    this.assetsSettings = app.settings.assets || {};
  }


  /**
   * 渲染模块
   *
   * @param {RenderData}    rd      - 渲染上下文对象
   * @param {ActionContext} ctx     - 控制器执行上下文
   * @param {Boolean}       incept  - 是否执行过滤器，即beforeRender & afterRender
   *                                  渲染control时不执行过滤器
   * @return {RenderResult}         - 渲染结果
   */
  * render(rd, ctx, incept) {
    logger.debug('render: %s', rd.view);

    this.development && vertify(rd);

    const view = resolveView(this, rd, rd.view);
    if (!view) {
      logger.error('view not found: %s', rd.view);
      return RenderHelper.notFound(rd.view, this.development);
    }

    logger.debug('view resolved: %o', view);

    // 依赖，Promise对象数组
    rd.depends = [];
    // 前端资源
    rd.assets = rd.assets || {};
    // 帮助方法
    rd.helpers = new HelperContainer(rd, this, this.navigator, this.app);

    if (ctx) {
      // 控制器中可以通过helpers取得渲染帮助方法
      ctx.helpers = rd.helpers;
    }

    return yield* render(this, rd, view, ctx, incept);
  }


  /**
   * 异步渲染
   *
   * @param {Object}  rd    - 当前模块RunData
   * @param {Promise} defer - 异步渲染Promise对象
   * @param {String}  url   - 可选，仅用于调试，用于not found时输出信息
   * @return {String}       - 结果占位符
   */
  renderAsync(rd, defer, url) {
    return RenderHelper.renderAsync(rd, defer, url, this.development);
  }
}


module.exports = ViewRender;


/*
 * 验证RunData完整性，因为参数比较多可能搞错
 */
function vertify(rd) {
  const fields = ['info', 'route', 'view', 'data', 'ctx'];
  for (const name of fields) {
    assert(rd[name], 'rd.' + name + ' not specified');
  }
}


/*
 * 具体的渲染流程
 */
function* render(self, rd, view, ctx, incept) { // eslint-disable-line
  // beforeRender
  if (incept) {
    const ret = yield* beforeRender(self, rd, ctx);
    if (ret === false) {
      return ctx.body !== undefined && ctx.body !== null ?
          { content: ctx.body } : null;
    }
  }

  // 渲染内容
  let body = yield* renderContent(self, rd, view);

  // afterRender
  if (incept) {
    ctx.body = body;
    yield* afterRender(self, rd, ctx);
    body = ctx.body;
  }

  // 内部调用需要处理assets
  rd.route.navigate && tryTransformAssets(rd);

  return { content: body, assets: rd.assets };
}


ViewRender.TEMPLATE_TIMEOUT = 3000;

/**
 * 渲染内容
 */
const renderCache = yieldCache();
function* renderContent(self, rd, view) {
  // 直接重用helper container对象减少对象的构造
  const context = rd.helpers;
  assign(context, rd.data);

  const path = pathUtil.join(view.root, view.template);

  // 开发状态3秒缓存失效
  self.development && setTimeout(function() {
    renderCache.remove(path);
  }, ViewRender.TEMPLATE_TIMEOUT);

  // 渲染器
  const fn = yield* renderCache(path, function() {
    return getRender(self, path);
  });

  logger.debug('render template: %s', path);

  // 调用渲染器
  let content = fn(context);

  // 添加View对应的前端资源
  attachAssets(self, rd, view);

  // 渲染子View
  content = yield* RenderHelper.renderChildren(rd, content);

  logger.debug('render template success: %s', path);

  return content;
}


/*
 * 解析View
 */
function resolveView(self, rd, view) {
  const viewRoute = RouteInfo.parse(rd.route, view);

  // 本模块view，直接从info取得
  if (rd.route.module === viewRoute.module) {
    return regularView(rd.info, rd.info.views[viewRoute.action]);
  }

  // 其他模块view
  const info = self.moduleResolver.resolve(viewRoute.module);
  return info && regularView(info, info.views[viewRoute.action]);
}


/*
 * 规范化View对象
 */
function regularView(info, view) {
  if (!view) {
    return null;
  }
  // 本来应该产生一个新的对象的
  // 但是它调用很频繁，所以就直接设置属性了
  view.root = info.path;
  return view;
}



/*
 * 请求和编译模板
 *
 * @param {String} path
 * @return {Promise}
 */
function getRender(self, path) {
  logger.debug('get render: %s', path);

  const ext = pathUtil.extname(path).substr(1); // remove prefix .
  const engine = self.engines[ext];
  if (!engine) {
    const e = new Error('render engine not exists: ' + ext);
    return Promise.reject(e);
  }

  return fs.readFile(path, 'utf-8').then(tpl => {
    const opts = { development: self.development, path: path };
    const fn = engine.compile(tpl, opts);
    logger.debug('comple template success: %s', path);
    return fn;
  });
}


/*
 * 执行beforeRender过滤器
 */
function* beforeRender(self, rd, ctx) {
  const ret = yield* invoker.filter(self.filters, 'beforeRender', ctx);
  if (ret === false) {
    return false;
  }

  const fn = rd.module.beforeRender;
  if (fn) {
    return is.generatorFunction(fn) ?
        yield* fn.call(ctx) : fn.call(ctx);
  }

  return null;
}


/*
 * 执行afterRender过滤器
 */
function* afterRender(self, rd, ctx) {
  const fn = rd.module.afterRender;
  if (fn) {
    const ret = is.generatorFunction(fn) ?
        yield* fn.call(ctx) : fn.call(ctx);
    if (ret === false) {
      return false;
    }
  }

  return yield* invoker.filter(self.filters, 'afterRender', ctx, true);
}


/*
 * 将view相关的前端资源添加到上下文中
 * 使用的是assets helper
 * 可以通过设置`assets.disableAutowire=false`关闭，默认开启
 */
function attachAssets(self, rd, view) {
  const settings = self.assetsSettings;
  if (settings.disableAutowire) {
    return;
  }

  const route = rd.route;
  const type = route.type === 'layout' ? 'layout' : 'default';
  const bag = rd.assets[type] ||
      (rd.assets[type] = { css: [], js: [] });

  view.css && bag.css.push({
    route: RouteInfo.parse(route, view.css)
  });

  view.js && bag.js.push({
    route: RouteInfo.parse(route, view.js)
  });
}


function tryTransformAssets(rd) {
  const helper = rd.helpers.assets;
  if (helper && typeof helper.transform === 'function') {
    logger.debug('try transform assets');
    helper.transform(rd.assets);
  }
}

