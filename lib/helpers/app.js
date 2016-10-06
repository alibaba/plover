'use strict';


const assert = require('assert');
const co = require('co');

const SafeString = require('plover-util/lib/safe-string');
const assign = require('plover-util/lib/assign');
const RouteInfo = require('plover-util/lib/route-info');

const RenderHelper = require('../core/render-helper');

const logger = require('plover-logger')('plover:helpers/app');



/**
 * 默认提供的Helper
 * 用来在模板中渲染`view`, `control`等
 */
class AppHelper {

  static $init(rd, viewRender, navigator, app) {
    this.self = rd.data;
    this.json = JSON.stringify;
    this.query = rd.route.query;
    this.route = rd.route;
    this.settings = app.settings;
  }

  constructor(rd, viewRender, navigator, app) {
    this.rd = rd;

    this.moduleResolver = app.moduleResolver;
    this.navigator = navigator;
    this.viewRender = viewRender;

    this.development = app.settings.development;
  }


  /**
   * 渲染一个view
   * view是可重用的业务单元，一般来说有完整的数据，前端资源，和模板等
   *
   * @param  {String} url   - id，格式为 module:action，module不指定时为当前模块
   * @param  {Object} data  - 数据，可选
   * @return {String}       - 渲染结果，如果是异步渲染的话是一个占位符
   */
  view(url, data) {
    assert(url, 'app.view() - url required');

    const self = this;
    const thisRoute = this.rd.route;
    const route = RouteInfo.parse(thisRoute, url);

    // view的query继承root的query
    let query = route.root.query;
    if (data) {
      query = assign({}, route.root.query, data);
    }

    route.query = query;

    logger.debug('try render view: %s', url);
    const gen = self.navigator.navigate(route);
    return renderChild(this.rd, gen, url, self.development);
  }


  /**
   * 渲染一个control
   * control是可重用的模板单元
   * control没有数据源，它的存在是为了重用模板结构
   * control默认继承父view的上下文环境
   *
   * @param  {String} url   - id，格式同`view`方法
   * @param  {Object} data  - 数据，可选
   * @return {String}       - 渲染结果
   */
  control(url, data) {
    return this.viewRender.include(this.rd, url, data);
  }


  /**
   * 设置布局数据
   * @param {String} name   - 名称
   * @param {Any}    value  - 值
   */
  set(name, value) {
    this.rd.layout.data[name] = value;
  }
}


module.exports = AppHelper;



/*
 * 渲染子view
 *
 * @param {RunData}   - rd
 * @param {Generator} - gen
 * @param {String}    - url
 * @param {Boolean}   - development
 */
function renderChild(rd, gen, url, development) {
  const ret = tryQuickRender(gen, url, development);
  if (ret.done) {
    logger.debug('quick render: %s', url);
    rd.depends.push({ assets: ret.value.assets });
    return new SafeString(ret.value.content);
  }

  const defer = co(new ProxyGenerator(gen, ret));
  logger.debug('async render: %s', url);
  return RenderHelper.renderAsync(rd, defer, url, development);
}


function tryQuickRender(gen, url, development) {
  let ret = null;

  try {
    ret = gen.next();
    if (!ret.done) {
      return ret;
    }

    if (!ret.value) {
      logger.error('child view not found: %s', url);
      ret.value = RenderHelper.notFound(url, development);
    }
  } catch (e) {
    e.url = url;
    ret = {
      done: true,
      value: RenderHelper.renderError(e, development)
    };
  }

  return ret;
}


class ProxyGenerator {
  constructor(gen, ret) {
    this.gen = gen;
    this.ret = ret;
    this.first = true;
  }

  next(value) {
    if (this.first) {
      this.first = false;
      return this.ret;
    }
    return this.gen.next(value);
  }
}

