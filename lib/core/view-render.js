'use strict';


const assert = require('assert');
const pathUtil = require('path');
const fs = require('fs');

const is = require('is-type-of');
const assign = require('plover-util/lib/assign');
const RouteInfo = require('plover-util/lib/route-info');
const SafeString = require('plover-util/lib/safe-string');

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

    const view = resolveView(this, rd.route, rd.view);
    if (!view) {
      const url = rd.route.module + ':' + rd.view;
      logger.error('view not found: %s', url);
      return RenderHelper.notFound(url, this.development);
    }

    // 依赖，Promise对象数组
    rd.depends = [];
    // 前端资源
    rd.assets = rd.assets || {};
    // 帮助方法
    rd.helpers = new HelperContainer(rd, this, this.navigator, this.app);
    // 渲染状态链
    rd.states = [];

    if (ctx) {
      // 控制器中可以通过helpers取得渲染帮助方法
      ctx.helpers = rd.helpers;
    }

    return yield* render(this, rd, view, ctx, incept);
  }


  /**
   * 渲染一个子模板
   *
   * @param {RenderData} rd   - rd
   * @param {String}     name - 视图名
   * @param {Object}     data - 数据，可选
   * @return {String|Promise} 渲染结果
   */
  include(rd, name, data) {
    const state = rd.states[0];
    const view = resolveView(this, state.route, name);
    if (!view) {
      const url = state.route.module + ':' + name;
      logger.error('control not found: %s', url);
      const o = RenderHelper.notFound(url, this.development);
      return new SafeString(o.content);
    }

    // 渲染器
    const o = compileTpl(this, view);

    let context = state.context;
    if (data) {
      context = Object.create(context);
      assign(context, data);
    }

    rd.states.unshift({
      route: view.route,
      context: context
    });
    const content = o.fn(context);
    attachAssets(this, rd, view);
    rd.states.shift();

    return processIncludeResult(this, rd, view, data, content);
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


/*
 * 渲染内容
 */
function* renderContent(self, rd, view) {
  // 直接重用helper container对象减少对象的构造
  const context = rd.helpers;
  assign(context, rd.data);

  // 渲染器
  const o = compileTpl(self, view);

  rd.async = o.async;
  rd.states.unshift({
    route: view.route,
    context: context
  });

  let content = o.fn(context);
  attachAssets(self, rd, view);

  rd.states.shift();
  assert(rd.states.length === 0, 'rd.states should empty');

  if (content && is.promise(content)) {
    content = yield content;
  }

  content = yield* RenderHelper.renderChildren(rd, content);
  return content;
}


/*
 * 解析View
 */
function resolveView(self, route, name) {
  const viewRoute = RouteInfo.parse(route, name);
  const info = self.moduleResolver.resolve(viewRoute.module);
  const view = info && info.views[viewRoute.action];
  if (!view) {
    return null;
  }

  const path = pathUtil.join(info.path, view.template);
  const type = pathUtil.extname(path).substr(1);

  return {
    route: viewRoute,
    path: path,
    type: type,
    js: view.js,
    css: view.css
  };
}


ViewRender.TEMPLATE_TIMEOUT = 3000;
const renderCache = new Map();

/*
 * 请求和编译模板
 *
 * @param {Object} view
 * @return {Function}
 */
function compileTpl(self, view) {
  const path = view.path;
  const cached = renderCache.get(path);
  if (cached) {
    return cached;
  }

  const engine = self.engines[view.type];
  if (!engine) {
    throw new Error('template engine not found: ' + view.type);
  }

  // 编译模板时同步读取, 生产环境会走cache的
  const tpl = fs.readFileSync(path, 'utf-8');
  const opts = { development: self.development, path: path };
  const fn = engine.compile(tpl, opts);
  logger.debug('comple template: %s', path);
  const o = {
    async: !!engine.async,
    fn: fn
  };

  renderCache.set(path, o);
  // 开发环境下cache超时
  self.development && setTimeout(function() {
    renderCache.delete(path);
  }, ViewRender.TEMPLATE_TIMEOUT);

  return o;
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
 * 可以通过设置`assets.disableAutowire=false`关闭，默认开启
 */
function attachAssets(self, rd, view) {
  if (self.assetsSettings.disableAutowire) {
    return;
  }

  if (!(view.css || view.js)) {
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


/*
 * navigate结束后需要将assets资源转换成url返回
 */
function tryTransformAssets(rd) {
  const helper = rd.helpers.assets;
  if (helper && typeof helper.transform === 'function') {
    logger.debug('try transform assets');
    helper.transform(rd.assets);
  }
}


/* eslint max-params: [2, 5] */
function processIncludeResult(self, rd, view, data, content) {
  const url = view.route.url;
  if (is.promise(content)) {
    if (rd.async) {
      logger.debug('include[promise]: %s, %o', url, data);
      return content.then(output => {
        return new SafeString(output);
      });
    }
    logger.debug('include[async]: %s, %o', url, data);
    const defer = content.then(output => {
      return { content: output };
    });
    return RenderHelper.renderAsync(rd, defer, url, self.development);
  }
  logger.debug('include %s, %o', url, data);
  return new SafeString(content);
}
