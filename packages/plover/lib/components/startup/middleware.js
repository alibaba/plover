'use strict';


const assert = require('assert');
const compose = require('koa-compose');
const lang = require('plover-util/lib/lang');

const util = require('../../util/util');


module.exports = function(app) {
  const settings = app.settings;
  const root = settings.applicationRoot;

  const list = settings.middlewares || [];
  for (let item of list) {
    // 默认级别为3
    if (typeof item === 'string') {
      item = { module: item, level: 3 };
    }

    // middleware域是为了兼容原来的配置
    // 建议使用module或modules属性
    let mws = item.module || item.modules || item.middleware;
    mws = Array.isArray(mws) ? mws : [mws];
    loadMiddlewares(app, root, mws, item);
  }
};


function loadMiddlewares(app, root, mws, options) {
  mws = mws.map(path => {
    let mw = util.loadModule(root, path);
    assert(typeof mw === 'function',
      'middleware should be function: ' + path);

    if (!lang.isGeneratorFunction(mw)) {
      mw = mw(app.config, app.server, app);
    }

    assert(lang.isGeneratorFunction(mw),
        'generator function required: ' + path);

    mw.$name = path;

    return mw;
  });

  let middleware = null;
  if (mws.length > 1) {
    middleware = compose(mws);
    middleware.$name = 'compose-' +
      mws.map(function(mw) {
        return mw.name || mw.$name;
      }).join('|');
  } else {
    middleware = mws[0];
  }

  app.addMiddleware(middleware, options);
}
