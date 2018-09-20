const pathUtil = require('path');
const debug = require('debug')('plover-web:plugin');
const util = require('./util/util');


module.exports = function(app) {
  const config = app.settings.web || {};

  if (config.keys) {
    initKeys(app, config.keys);
  }

  installKoaUtillity(app, config);
  installSession(app, config.session);
  installFlash(app);

  if (config.outputCharset) {
    installOutputCharset(app, config);
  }

  installSecurityHeaders(app);

  require('./web/query')(app);
  require('./web/params')(app);
  require('./web/csrf')(app, config.csrf);

  installCors(app, config.cors);

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


function installCors(app, config) {
  const { match, ...ext } = config || {};
  if (!match || !match.length) {
    return;
  }
  const rules = util.regularRules(match);
  const cors = require('@koa/cors');
  const origin = ctx => {
    if (util.testRules(rules, ctx.hostname)) {
      return ctx.get('Origin');
    }
    return null;
  };
  const mw = cors({ ...ext, origin });
  add(app, mw);
}


function installOutputCharset(app, config) {
  const mw = require('./web/charset')(config);
  add(app, mw);
}

function installSession(app, config) {
  const mw = require('./web/session')(config, app.server);
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
  app.use(mw, { level: level });
}
