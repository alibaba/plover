'use strict';

const pathUtil = require('path');

const debug = require('debug')('plover-web:plugin');


module.exports = function(app) {
  const config = app.settings.web || {};

  if (config.keys) {
    initKeys(app, config.keys);
  }

  installKoaUtillity(app, config);

  require('./web/session')(app, config.session);
  require('./web/flash')(app);

  if (config.outputCharset) {
    installOutputCharset(app, config);
  }

  installSecurityHeaders(app);

  require('./web/query')(app);
  require('./web/params')(app);
  require('./web/csrf')(app, config.csrf);

  require('./security/assert-method')(app);
};


function initKeys(app, keys) {
  keys = typeof keys === 'string' ? [keys] : keys;
  app.server.keys = keys;
}


function installKoaUtillity(app, config) {
  install(app, 'koa-favicon', config.favicon);
  install(app, 'koa-response-time', config.rtime);
  install(app, 'koa-conditional-get', config.conditional);
  install(app, 'koa-etag', config.etag);

  // 默认开启body parser
  install(app, 'koa-bodyparser', config.bodyParser || {});

  config.static && installStatic(app, config.static);
}


function install(app, name, config) {
  if (!config || config.enable === false) {
    return;
  }

  debug('install %s: %o', name, config);
  const fn = require(name);
  const mw = fn(config);
  mw.$name = name;
  app.addMiddleware(mw, 0);
}


function installOutputCharset(app, config) {
  const mw = require('./web/charset')(config);
  app.addMiddleware(mw, 0);
}


function installSecurityHeaders(app) {
  const opts = (app.settings.security || {}).headers || {};
  const mw = require('./security/security-headers')(opts);
  app.addMiddleware(mw, 0);
}


function installStatic(app, config) {
  const root = config.root ||
      pathUtil.join(app.settings.applicationRoot, 'public');

  const opts = Object.assign({}, config);
  const mw = require('koa-static')(root, opts);
  // after navigate
  app.addMiddleware(mw, 4);
}
