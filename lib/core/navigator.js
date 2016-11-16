'use strict';


const pathUtil = require('path');
const is = require('is-type-of');
const assign = require('plover-util/lib/assign');
const SafeString = require('plover-util/lib/safe-string');
const RouteInfo = require('plover-util/lib/route-info');

const ActionContext = require('./action-context');
const ActionRunner = require('./action-runner');
const ViewRender = require('./view-render');


const logger = require('plover-logger')('plover:core/navigator');


const LAYOUT = Symbol('layout');


class Navigator {

  /**
   * 处理Plover模块渲染逻辑
   *
   * 一个请求对应一个Navigator对象
   * 由components/navigate构造，并调用navigate方法
   * 由于一个页面可能会有多个模块拼装而成
   * 所以会递归多次调用navigate方法，这发生在模板(通过app.view/app.control)中
   *
   * @param {PloverApplication} app   - Plover应用对象
   * @param {KoaContext}    ctx       - Koa上下文
   */
  constructor(app, ctx) {
    this.settings = app.settings;
    this.development = app.settings.development;

    this.app = app;
    this.ctx = ctx;

    this.moduleResolver = app.moduleResolver;

    this.filters = app.filters;
    this.actionRunner = new ActionRunner(app, this);
    this.viewRender = new ViewRender(app, this);

    const layout = this.settings.defaultLayout || 'layouts:view';

    // 一个请求只对应于一个layout对象
    this[LAYOUT] = {
      enable: true,
      name: layout,
      data: {}
    };
  }


  /**
   * 请求一个模块的`Action`
   *
   * @param {RouteInfo} route - 路由信息
   *  - module  模块名
   *  - action  action名
   *  - query   参数
   *
   *  - type    类型，可选，比如json,view等, 默认情况下根据url扩展名推断
   *  - layout  布局，可选，默认为layouts:view
   *
   * @return {Object|false}  执行结果
   */
  * navigate(route) {
    logger.debug('navigate %o', route);

    const o = resolveModule(this, route);
    if (!o) {
      logger.warn('action: %s:%s not found, break', route.module, route.action);
      return false;
    }

    logger.debug('module resolved: %o', o.info);

    // 入口模块，需要根据route处理下layout
    if (!route.parent) {
      // 允许通过路由配置layout=false, false可能是个字符串
      if (route.layout === false || route.layout === 'false') {
        this[LAYOUT].enable = false;
      } else if (route.layout) {
        this[LAYOUT].name = route.layout;
      }
    }

    route.type = route.type || getRouteType(this, route, o.info);

    const rd = createRenderData(this, route, o);
    const ctx = new ActionContext(this, rd);
    const result = yield* this.actionRunner.run(rd, ctx);
    return yield* navigateForResult(this, rd, ctx, result);
  }
}


module.exports = Navigator;


/*
 * 根据路由信息加载模块
 *
 * @param {RouteInfo} route - 路由信息
 * @return                  - 模块信息
 * {
 *  info: 模块信息
 *  module: 模块对象
 * }
 */
function resolveModule(self, route) {
  const info = self.moduleResolver.resolve(route.module);
  if (!info) {
    return null;
  }

  const module = loadModule(self, info.name, info.path);
  if (!module) {
    return null;
  }

  // 未提供相应action方法，当作找不到处理
  const fn = module[route.action];
  if (!fn || typeof fn !== 'function') {
    return null;
  }

  return { info: info, module: module };
}


/*
 * 加载模块对象
 */
const moduleCache = new Map();

function loadModule(self, name, path) {
  if (moduleCache.has(name)) {
    return moduleCache.get(name);
  }

  try {
    path = require.resolve(path);
  } catch (e) {
    return null;
  }

  if (self.development) {
    delete require.cache[path];
  }

  try {
    const module = require(path);
    if (!self.development) {
      moduleCache.set(name, module);
    }
    return module;
  } catch (e) {
    throw new Error('load controller error: ' + path + '\n' + e.stack);
  }
}


/*
 * 默认情况下支持`.json`和`.jsonp`扩展名请求
 * 可以通过`disableFlexRouteType`关闭
 */
function getRouteType(self, route, info) {
  if (self.settings.disableFlexRouteType ||
        info.views[route.action]) {
    return 'view';
  }

  const ext = pathUtil.extname(self.ctx.path);
  if (ext === '.json' || ext === '.jsonp') {
    return 'json';
  }

  return 'view';
}


/*
 * 创建`RenderData`用于执行过程中传递模型信息
 * 这里直接使用传递过来的o对象避免重复构造
 * 因为o是刚刚通过resolveModule构造出来的新对象
 *
 * @return {RenderData}
 *  下列属性由o提供
 *  - info
 *  - module
 *
 *  下列属性由此方法设置
 *  - route
 *  - data
 *  - ctx
 *
 *  - type
 *  - view
 *  - layout
 */
function createRenderData(self, route, o) {
  const rd = o;

  rd.route = route;
  rd.data = {};
  rd.ctx = self.ctx;

  rd.type = route.type;
  rd.view = route.action;     // 默认以action名称作为view
  rd.layout = self[LAYOUT];

  return rd;
}


/*
 * 响应Action执行结果
 */
/* eslint complexity: [2, 8] */
function* navigateForResult(self, rd, ctx, result) {
  // 1. action中已得到结果
  if (result) {
    // for call navigator.navigate() without yield
    if (is.generator(result)) {
      result = yield* result;
    }
    return yield* tryRenderLayout(self, rd, result);
  }

  // 2. 没有调用render，直接使用this.body当作结果
  if (result === false || !ctx.shouldRender) {
    // 通过`this.body`设置就直接返回吧，不需要再渲染layout了
    return isNotEmpty(ctx.body) ? { content: ctx.body } : null;
  }

  // 3. 返回数据
  if (rd.type === 'json') {
    return { data: rd.data };
  }

  // 4. 渲染，需要执行渲染拦载器
  result = yield* self.viewRender.render(rd, ctx);
  return yield* tryRenderLayout(self, rd, result);
}


function* tryRenderLayout(self, rd, result) {
  const route = rd.route;
  // 要渲染layout必须同时满足以下要求
  // 1. action有渲染结果, 即result.content存在
  // 2. 非navigate流程
  // 3. 入口模块
  // 4. rd.layout.enable为true
  if (result && ('content' in result) &&
      !route.navigate &&
      !route.parent &&
      rd.layout.enable) {
    result = yield* renderLayout(self, route, rd.layout, result);
  }
  return result;
}


/*
 * 渲染布局
 */
function* renderLayout(self, contentRoute, layout, result) {
  logger.debug('render layout for: %s[%s]', contentRoute.url, layout.name);

  const route = RouteInfo.parse(contentRoute, layout.name);
  route.type = 'layout';
  // 布局的参数和根route参数一样
  route.query = route.root.query;

  const o = resolveModule(self, route);
  if (!o) {
    logger.error('layout module not exits: %s', layout.name);
    return null;
  }

  logger.debug('module resolved: %o', o.info);

  const rd = createRenderData(self, route, o);
  assign(rd.data, layout.data);
  // 控制器中可以使用view渲染结果
  rd.data.content = result.content;

  const ctx = new ActionContext(self, rd);

  yield* self.actionRunner.run(rd, ctx);
  if (!ctx.shouldRender) {
    return isNotEmpty(ctx.body) ? { content: ctx.body } : null;
  }

  rd.assets = result.assets;
  // 包装string成SafeString，方便模板引擎原样渲染
  rd.data.content = new SafeString(rd.data.content);

  return yield* self.viewRender.render(rd, ctx);
}


function isNotEmpty(o) {
  return o !== undefined && o !== null;
}

