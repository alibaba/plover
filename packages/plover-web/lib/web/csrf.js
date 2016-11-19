'use strict';


const util = require('../util/util');

const debug = require('debug')('plover-web:web/csrf');


module.exports = function(app, config) {
  config = config || {};
  if (config.enable === false) {
    return;
  }

  debug('install csrf module: %o', config);
  require('koa-csrf')(app.server, config);
  const mw = middleware(config);
  app.addMiddleware(mw, 0);
};


module.exports.middleware = middleware;
//~


function middleware(opts) {
  opts = opts || {};
  const matchRules = util.regularRules(opts.match);
  const ignoreRules = util.regularRules(opts.ignore);

  debug('rules, match: %o, ignore: %o', matchRules, ignoreRules);

  return function* PloverCsrf(next) {
    // 如果match匹配了，就检查csrf
    if (util.testRules(matchRules, this.path)) {
      return yield* nextWithAssert(this, next);
    }

    // 忽略 get, head, options 请求
    const method = this.method;
    if (method === 'GET' ||
        method === 'HEAD' ||
        method === 'OPTIONS') {
      return yield* next;
    }

    // multipart自己处理csrf
    if (this.is('multipart')) {
      return yield* next;
    }

    // 如果ignore规则匹配，就忽略检查
    if (util.testRules(ignoreRules, this.path)) {
      debug('ignore check csrf ctoken: %s', this.path);
      return yield* next;
    }

    yield* nextWithAssert(this, next);
  };
}


function* nextWithAssert(ctx, next) {
  const assertCsrf = ctx.assertCsrf || ctx.assertCSRF;
  if (assertCsrf) {
    const body = ctx.request.body || {};
    debug('check csrf: %s, %s', ctx.path, body._csrf);
    assertCsrf.call(ctx, body);

    // 设置标识域，表示已校验过ctoken
    ctx[util.CSRF_CHECKED] = true;
  }
  yield* next;
}

