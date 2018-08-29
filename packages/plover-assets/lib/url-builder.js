const arrayUtil = require('plover-util/lib/array');
const logger = require('plover-logger')('plover-assets:url-builder');
const concatUrl = require('./util/concat-url');
const assetsUtil = require('./util/util');


/**
 * 默认的UrlBuilder
 */
class UrlBuilder {
  constructor(app) {
    const settings = app.settings;

    this.moduleResolver = app.moduleResolver;
    this.isConcatEnabled = isConcatEnabled(settings);
    this.urlPrefix = getUrlPrefix(settings);

    const config = settings.assets || {};
    this.concatItems = config.concatItems;
    this.manifest = settings.development ?
      null : assetsUtil.loadManifest(settings);
  }


  buildUrl(route) {
    const info = this.moduleResolver.resolve(route.module);
    if (!info) {
      logger.error('can not resolve module: %s', route.module);
      return '';
    }
    if (!info.assets) {
      logger.error('invalid assets module: %s', route.module);
      return '';
    }

    let url = info.name + '/' + (route.action || '');
    if (this.manifest) {
      url = this.manifest.get(url) || url;
    }
    return this.urlPrefix + '/' + url;
  }


  buildTagUrls(assets, type, groups) {
    let urls = getAssetsUrls(assets, type, groups);
    if (this.isConcatEnabled) {
      urls = concatUrls(this, urls);
    }
    return urls;
  }
}


module.exports = UrlBuilder;


function getUrlPrefix(settings) {
  const assets = settings.assets || {};
  const prefix = assets.prefix || '/g';
  return settings.development ? prefix :
    (assets.urlPrefix || prefix);
}


function getAssetsUrls(assets, type, groups) {
  const set = new Set();
  const urls = [];
  for (const name of groups) {
    const group = assets[name];
    if (!group) {
      continue; // eslint-disable-line
    }

    const list = group[type];
    for (const item of list) {
      const url = item.url;
      if (!set.has(url)) {
        urls.push(url);
        set.add(url);
      }
    }
  }
  return urls;
}


function concatUrls(self, urls) {
  const items = self.concatItems;
  const o = groupUrls(items, urls);

  const results = o.defs;
  o.groups.forEach((list, index) => {
    arrayUtil.pushAll(results, concatUrl(items[index].prefix, list));
  });

  return results;
}


/**
 * 是否打开urlConcat功能
 *
 * 开发环境下总是关闭的
 * 在其他环境下可以通过配置assets.enableConcat来开启或关闭
 *
 * @param {Object} settings - 配置
 * @return {Boolean}        - 是否打开url concat
 */
function isConcatEnabled(settings) {
  if (settings.development) {
    return false;
  }
  return (settings.assets || {}).enableConcat;
}


/**
 * 根据concat规则打成几组
 *
 * @param {Array} items - concat匹配规则
 * @param {Array} urls  - url 列表
 * @return {Object}     - 组信息
 *  - defs    - 不能concat的url列表
 *  - groups  - 已被concat的url列表
 */
function groupUrls(items, urls) {
  const defs = [];
  const groups = [];
  const c = items.length;

  for (const url of urls) {
    let find = false;
    for (let i = 0; i < c; i++) {
      const item = items[i];
      groups[i] = groups[i] || [];
      const match = item.match.exec(url);
      if (match) {
        groups[i].push(match[1]);
        find = true;
        break;
      }
    }
    find || defs.push(url);
  }

  return { defs: defs, groups: groups };
}
