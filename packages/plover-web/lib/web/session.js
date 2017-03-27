'use strict';

/* eslint import/no-unresolved: 0 */

module.exports = function(app, opts) {
  opts = opts || {};
  const store = opts.store;

  if (store === 'redis') {
    installRedisSession(app, opts);
    return;
  }

  installCookieSession(app, opts);
};


function installRedisSession(app, opts) {
  const session = require('koa-generic-session');
  const redisStore = require('koa-redis');

  opts = Object.assign({}, opts);
  opts.store = redisStore(opts.storeOpts);

  const mw = session(opts);
  app.addMiddleware(mw, 0);
}


function installCookieSession(app, opts) {
  const mw = require('koa-session')(opts, app.server);
  app.addMiddleware(mw, 0);
}
