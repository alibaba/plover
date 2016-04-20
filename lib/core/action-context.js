'use strict';


const delegate = require('delegates');

const RouteInfo = require('plover-util/lib/route-info');

const util = require('../util/util');

const NAVIGATOR = Symbol('navigator');
const RD = Symbol('rd');
const PARAMS = Symbol('params');


/**
 * Action执行上下文
 *
 * - Action中可以使用`this`取得`Context`对象，调用它提供的服务
 *
 * - 可以使用以下属性和方法
 *  query   - 路由后的query参数
 *  params  - 包含post(如果是POST请求)和query参数，方便不管请求类型场景下的参数获取
 *
 *  type
 *  view
 *  layout
 *
 *  ctx
 *  request
 *  response
 *  session
 *  cookies
 *
 *  route   - 当前路由对象
 *  minfo   - 当前模块信息
 *  state   - koa对应的state对象，用于在不同action间共享数据
 *  data    - 模板或Action中使用的上下文数据
 *
 *  moduleResolver  - 模块解析器
 *  settings
 *  config
 *
 * - 可以调用以下方法
 *  throw()
 *  assert()
 *  redirect()
 *
 *  render([data], [options])   - 渲染数据或视图
 *  navigate(route, [options])  - 调用另一个`Action`
 */
class ActionContext {

  constructor(navigator, rd) {
    this[NAVIGATOR] = navigator;
    this[RD] = rd;

    const ctx = rd.ctx;

    this.ctx = ctx;
    this.request = ctx.request;
    this.response = ctx.response;
    this.session = ctx.session;
    this.cookies = ctx.cookies;

    this.route = rd.route;
    this.minfo = rd.info;

    Object.assign(this, ctx.state);
    this.state = ctx.state;
    this.data = rd.data;

    if (ctx.data) {
      Object.assign(this.data, ctx.data);
    }
  }


  /**
   * 获得请求参数, 除了get参数外，还包含路由产生的额外参数
   *
   * @return {Object} - query
   */
  get query() {
    return this.route.query;
  }


  /**
   * 除了get参数外还包括post参数
   *
   * @return {Object} - params
   */
  get params() {
    if (!this[PARAMS]) {
      this[PARAMS] = Object.assign({}, this.route.query,
        this.ctx.request.body);
    }
    return this[PARAMS];
  }


  /**
   * 取得type
   */
  get type() {
    return this[RD].type;
  }


  /**
   * 设置type
   *
   * @param {String} value - type
   */
  set type(value) {
    this[RD].type = value;
  }


  /**
   * 取得view
   *
   * @return {String} - value
   */
  get view() {
    return this[RD].view;
  }


  /**
   * 设置view
   *
   * @param {String} value - view
   */
  set view(value) {
    this[RD].view = value;
  }


  /**
   * 取得layout结构
   */
  get layout() {
    return this[RD].layout;
  }


  /**
   * 设置layout
   *
   * @param {false|String|Object} value - layout
   *
   * 1. 关闭布局
   *
   * ```
   * this.layout = false
   * ```
   *
   * 2. 设置另一个模块作为布局
   *
   * ```
   * this.layout = 'other:view'
   * ```
   *
   * 3. 设置布局数据，这其实是通过get方法
   *
   * this.layout.data.title = 'page title'
   *
   *
   * 4. 同时设置布局和数据
   *
   * this.layout = { name: 'other:view', data: ... }
   */
  set layout(value) {
    // 只允许根模块直接设置布局
    if (this.route.parent) {
      return;
    }

    const layout = this[RD].layout;

    // 1. this.layout = false
    if (!value) {
      layout.enable = false;
      return;
    }

    // 2. this.layout = 'other:view'
    if (typeof value === 'string') {
      layout.name = value;
    }

    // 3. this.layout = { name: ... data: ... }
    if (value.name) {
      layout.name = value.name;
    }

    if (value.data) {
      Object.assign(layout.data, value.data);
    }
  }


  /**
   * 渲染
   * @param {Object} data     - 数据
   * @param {Object} options  - 可选的额外配置
   */
  render(data, options) {
    if (this.shouldRender) {
      throw new Error('this.render() already called.');
    }
    this.shouldRender = true;
    data && Object.assign(this.data, data);

    if (options) {
      options.type && (this.type = options.type);
      options.view && (this.view = options.view);
      options.layout && (this.layout = options.layout);
    }
  }


  /**
   * 请求一个Action
   *
   * @param {String} route    - 路由信息，比如'offer:list'
   * @param {Object} options  - 额外的参数
   *  - query
   *
   * @return {Object}         - 渲染结果
   *  - content
   *  - assets
   */
  navigate(route, options) {
    options = options || {};

    route = RouteInfo.parse(this.route, route);
    // root从自己开始
    route.root = route;
    route.parent = null;
    route.type = options.type || 'view';
    route.navigate = true;

    // 默认继承父route query和渲染时逻辑一致
    route.query = options.query || this.route.query;
    return this[NAVIGATOR].navigate(route);
  }
}


module.exports = ActionContext;


delegate(ActionContext.prototype, 'ctx')
    .method('throw')
    .method('assert')
    .method('redirect');


ActionContext.refine = function(app) {
  const proto = ActionContext.prototype;

  proto.moduleResolver = app.moduleResolver;
  proto.settings = app.settings;
  proto.config = app.config;

  util.delegateGetters(proto, Object.keys(app.services), function(name) {
    return this.ctx.services.$get(name);
  });
};


