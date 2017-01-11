'use strict';


const assert = require('assert');
const router = require('./router');


module.exports = function(app) {
  app.addMiddleware(require('./method'), { after: 'koa-bodyparser' });

  const fn = app.config.routes || function() {};
  assert(typeof fn === 'function', 'config.routes should be typeof function.');

  const info = router(fn);

  const middlewares = info.middlewares;
  for (const item of middlewares) {
    const opts = Object.assign({}, item.options);
    opts.match = item.match;
    app.addMiddleware(item.middleware, opts);
  }

  const routes = info.routes;
  for (const route of routes) {
    app.addRoute(route.match, route.to, { method: route.verb });
  }
};
