'use strict';


class AssetsHelper {
  constructor(rd, viewRender) {
    this.rd = rd;
    this.viewRender = viewRender;
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

  transform() {
    // do nothing
  }
}


module.exports = AssetsHelper;


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
        const route = item.route;
        const url = `/${route.module}/${route.action}`;
        return fn(url);
      });

      return { content: tags.join('\n') };
    });
  });

  return self.viewRender.renderAsync(self.rd, defer, 'asserts-' + type);
}
