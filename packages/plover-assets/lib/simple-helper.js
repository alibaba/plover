const createTag = require('create-tag');
const assetsUtil = require('./util/util');

const rSlash = /^\//;
const rSlashEnd = /\/$/;


class Helper {
  static startup(app) {
    const settings = app.settings;
    const config = settings.assets || {};

    const prefix = config.prefix || '/g';
    const urlPrefix = settings.development ? prefix :
        (config.urlPrefix || prefix);

    this.urlPrefix = urlPrefix.replace(rSlashEnd, '');
    this.manifest = settings.development ? null :
        assetsUtil.loadManifest(settings);
  }


  constructor(rd) {
    this.assets = rd.assets;
    this.urlPrefix = Helper.urlPrefix;
    this.manifest = Helper.manifest;
  }


  url(url) {
    url = url.replace(rSlash, '');
    if (this.manifest) {
      url = this.manifest.get(url) || url;
    }
    return this.urlPrefix + '/' + url;
  }


  css(url, group) {
    push(this, 'css', url, group);
  }


  js(url, group) {
    push(this, 'js', url, group);
  }


  cssTag(group, attrs) {
    const urls = getUrls(this, group, 'css');
    return urls.map(url => {
      attrs = Object.assign({
        rel: 'stylesheet',
        href: url
      }, attrs);
      return createTag('link', attrs);
    }).join('\n');
  }


  jsTag(group, attrs) {
    const urls = getUrls(this, group, 'js');
    return urls.map(url => {
      attrs = Object.assign({ src: url }, attrs);
      return createTag('script', attrs, '');
    });
  }
}


module.exports = Helper;


function push(self, type, url, group) {
  group = group || 'default';
  url = self.url(url);
  const bag = self.assets[group] ||
      (self.assets[group] = { css: [], js: [] });
  const list = bag[type];
  list.push({ url });
}


function getUrls(self, group, type) {
  group = group || 'default';
  const list = (self.assets[group] || {})[type];
  return list.map(item => item.url);
}

