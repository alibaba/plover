const createTag = require('create-tag');

const SafeString = require('plover-util/lib/safe-string');
const RouteInfo = require('plover-util/lib/route-info');
const assign = require('plover-util/lib/assign');


const logger = require('plover-logger')('plover-assets:helper');


class AssetsHelper {
  static startup(app) {
    this.app = app;
    const config = app.settings.assets || {};
    this.simpleMode = config.simpleMode;
    this.tagAttrs = config.tagAttrs || {};
  }


  constructor(rd, viewRender) {
    this.rd = rd;
    this.assets = rd.assets;
    this.viewRender = viewRender;
    this.viewType = rd.route.type;

    this.urlBuilder = AssetsHelper.app.ploverAssetsUrlBuilder;

    if (!AssetsHelper.simpleMode && this.viewType === 'layout') {
      // 因为要正则替换实现assertsTag，所以将content也变成Promise
      // 这样替换时原文本会很小，速度较快
      const defer = Promise.resolve({ content: rd.data.content });
      rd.data.content = this.viewRender.renderAsync(rd, defer, 'page-content');
    }
  }


  get route() {
    return this.rd.states[0].route;
  }


  /**
   * 添加css
   *
   * @param {String} url    - 格式为标准的Plover Id，比如 common:css/button.css
   * @param {String} group  - 组名，可选
   */
  css(url, group) {
    push(this, 'css', url, group);
  }


  /**
   * 添加js
   *
   * @param {String} url    - 格式为标准的Plover Id，比如 common:js/button.js
   * @param {String} group  - 组名，可选
   */
  js(url, group) {
    push(this, 'js', url, group);
  }


  /**
   * 获取当前模块前端资源根访问地址
   *
   * @return {String}   - 模块资源根地址
   */
  get root() {
    const route = { module: this.route.module };
    return this.urlBuilder.buildUrl(route);
  }


  /**
   * 根据资源url取得资源访问地址
   *
   * @param {String} url  - 资源id
   * @return {String}     - 资源访问地址
   */
  url(url) {
    const route = RouteInfo.parse(this.route, url);
    return this.urlBuilder.buildUrl(route);
  }


  /**
   * 根据资源route信息取得资源访问地址
   *
   * @param {Object} route  - 路由信息
   * @return {String}       - 地址
   */
  resolve(route) {
    return this.urlBuilder.buildUrl(route);
  }


  /**
   * 创建css标签
   *
   * @return {String} css - tags
   */
  cssTag() {
    return createTags(this, 'css', arguments, createCssTag);
  }


  /**
   * 创建js标签
   *
   * @return {String} js - tags
   */
  jsTag() {
    return createTags(this, 'js', arguments, createJsTag);
  }


  /**
   * 将assets中的route项转换成url项
   * plover核心会调用此方法进行assets结构处理
   *
   * @param {Object} assets  - 资源结构
   */
  transform(assets) {
    transformAssetsGroup(this, assets);
  }
}


module.exports = AssetsHelper;


const rAbs = /^(\w+:)?\//;

function push(self, type, url, group) {
  if (!group) {
    group = self.viewType === 'layout' ? 'layout' : 'default';
  }

  const item = {};
  if (rAbs.test(url)) {
    item.url = url;
  } else {
    item.route = RouteInfo.parse(self.route, url);
  }

  logger.debug('push %s, [%s] %s', type, group, url);

  const bag = self.assets[group] ||
      (self.assets[group] = { css: [], js: [] });
  const list = bag[type];
  list.push(item);
}

/**
 * 创建assets标签
 *
 * @param {Object}  self   - 当前对象
 * @param {String}  type   - 资源类型css/js
 * @param {Array}   groups - 资源组
 * @param {Function}  fn   - 回调函数，用于构建tags
 * @return {String}        - 标签
 */
function createTags(self, type, groups, fn) {
  if (AssetsHelper.simpleMode) {
    return new SafeString(buildTags(self, type, groups, fn));
  }

  const defer = new Promise(resolve => {
    // 返回一个function是需要等输出那个时间点取前端资源
    // 否则太早取会遗漏一些并行渲染模块的资源
    resolve(function() {
      return { content: buildTags(self, type, groups, fn) };
    });
  });

  return self.viewRender.renderAsync(self.rd, defer, 'asserts-' + type);
}


const defaultGroups = ['layout', 'default'];

function buildTags(self, type, groups, fn) {
  // attrs是额外的添加到tag中的属性
  // 它取自配置assets.tagAttrs
  const group = groups[0] || 'default';
  let attrs = AssetsHelper.tagAttrs[type];
  attrs = attrs && attrs[group];

  // groups类型为arguments
  if (groups.length) {
    groups = Array.isArray(groups[0]) ? groups[0] : Array.from(groups);
  } else {
    // 没有设置groups，默认为defaultGroups
    groups = defaultGroups;
  }

  transformAssetsGroup(self, self.assets);

  const urls = self.urlBuilder.buildTagUrls(self.assets, type, groups, self.rd);
  let s = '';
  for (const url of urls) {
    s = s + fn(url, attrs) + '\n';
  }
  return s;
}


/**
 * 创建css标签
 *
 * @param {String} url      - url
 * @param {Object} options  - 额外属性
 * @return {String} tag     - 标签
 *
 */
function createCssTag(url, options) {
  const attrs = { rel: 'stylesheet', href: url };
  options && assign(attrs, options);
  return createTag('link', attrs);
}


/**
 * 创建js标签
 *
 * @param {String} url      - url
 * @param {Object} options  - 额外属性
 * @return {String} tag     - 标签
 */
function createJsTag(url, options) {
  const attrs = { src: url };
  options && assign(attrs, options);
  return createTag('script', attrs, '');
}


function transformAssetsGroup(self, assets) {
  for (const key in assets) {
    const bag = assets[key];
    transformAssets(self, bag.css);
    transformAssets(self, bag.js);
  }
}


function transformAssets(self, list) {
  for (const item of list) {
    if (item.route) {
      item.url = self.urlBuilder.buildUrl(item.route);
    }
  }
}

