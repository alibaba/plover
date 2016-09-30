'use strict';


const SafeString = require('plover-util/lib/safe-string')


class AssetsHelper {
  constructor(rd, viewRender) {
    this.rd = rd;
    this.viewRender = viewRender;
  }


  css(url) {
    push(this, 'css', url);
  }


  js(url) {
    push(this, 'js', url);
  }


  cssTag() {
    return createTag(this, 'css', url => {
      return `<link rel="stylesheet" href="${url}" />`;
    });
  }


  jsTag() {
    return createTag(this, 'js', url => {
      return `<script src="${url}"></script>`;
    });
  }


  transform(assets) {
    const fn = function(item) {
      return { url: getUrl(item) };
    };
    for (const group in assets) {
      const bag = assets[group];
      bag.css = bag.css.map(fn);
      bag.js = bag.js.map(fn);
    }
  }
}


module.exports = AssetsHelper;


function push(self, type, url) {
  const assets = self.rd.assets;
  const group = self.rd.route.type === 'layout' ? 'layout' : 'default';
  const bag = assets[group] ||
      (assets[group] = { css: [], js: [] });
  const list = bag[type];
  list.push({ url: url });
}


function createTag(self, type, fn) {
  const assets = self.rd.assets;
  const defer = new Promise(resolve => {
    resolve(function() {
      let layoutList = [];
      let defaultList = [];
      if (assets.layout) {
        layoutList = layoutList.concat(assets.layout[type]);
      }
      if (assets.default) {
        defaultList = defaultList.concat(assets.default[type]);
      }

      const list = layoutList.concat(defaultList);
      const tags = list.map(item => {
        return fn(getUrl(item));
      });

      return { content: new SafeString(tags.join('\n')) };
    });
  });

  return self.viewRender.renderAsync(self.rd, defer, 'assets-' + type);
}


function getUrl(item) {
  if (item.url) {
    return item.url;
  }
  const route = item.route;
  return `/${route.module}/${route.action}`;
}
