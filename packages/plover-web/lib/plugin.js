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
  installFlash(app);

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
  install(app, 'koa-compress', config.compress);

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
  add(app, mw);
}


function installOutputCharset(app, config) {
  const mw = require('./web/charset')(config);
  add(app, mw);
}


function installFlash(app) {
  const mw = require('./web/flash')(app);
  add(app, mw);
}


function installSecurityHeaders(app) {
  const opts = (app.settings.security || {}).headers || {};
  const mw = require('./security/security-headers')(opts);
  add(app, mw);
}


function installStatic(app, config) {
  const root = config.root ||
      pathUtil.join(app.settings.applicationRoot, 'public');

  const opts = Object.assign({}, config);
  const mw = require('koa-static')(root, opts);
  // after navigate
  add(app, mw, 4);
}


function add(app, mw, level) {
  level = level || 0;
  app.addMiddleware(mw, { level: level, bare: true });
}
