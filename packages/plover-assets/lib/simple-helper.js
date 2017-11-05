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
    this.viewType = rd.route.type;
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


  cssTag(group, opts) {
    const urls = getUrls(this, group, 'css');
    return urls.map(url => {
      const attrs = Object.assign({
        rel: 'stylesheet',
        href: url
      }, opts);
      return createTag('link', attrs);
    }).join('\n');
  }


  jsTag(group, opts) {
    const urls = getUrls(this, group, 'js');
    return urls.map(url => {
      const attrs = Object.assign({ src: url }, opts);
      return createTag('script', attrs, '');
    }).join('\n');
  }
}


module.exports = Helper;


function push(self, type, url, group) {
  if (!group) {
    group = self.viewType === 'layout' ? 'layout' : 'default';
  }
  url = self.url(url);
  const bag = self.assets[group] ||
      (self.assets[group] = { css: [], js: [] });
  const list = bag[type];
  list.push({ url });
}


function getUrls(self, groups, type) {
  groups = groups || ['layout', 'default'];
  if (!Array.isArray(groups)) {
    groups = [groups];
  }

  return groups.reduce((acc, group) => {
    const list = (self.assets[group] || {})[type];
    return list ? acc.concat(list) : acc;
  }, []).map(item => item.url);
}

