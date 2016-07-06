'use strict';


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
  const last = list[list.length - 1];
  // 放在autowire节点前面
  const pos = last && last.autowire ? list.length - 1 : list.length;
  list.splice(pos, 0, { url: url });
}


function createTag(self, type, fn) {
  const assets = self.rd.assets;
  const defer = new Promise(resolve => {
    resolve(function() {
      let list = [];
      if (assets.layout) {
        list = list.concat(assets.layout[type]);
      }
      if (assets.default) {
        list = list.concat(assets.default[type]);
      }

      const tags = list.map(item => {
        return fn(getUrl(item));
      });

      return { content: tags.join('\n') };
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
