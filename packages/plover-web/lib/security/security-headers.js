'use strict';


module.exports = function(opts) {
  opts = opts || {};

  return function* SecurityHeaders(next) {
    process(this);
    yield* next;
  };


  /**
   * 设置安全http相关头
   *
   * @param {KoaContext}  ctx  - koa-context
   */
  function process(ctx) {
    set(ctx, 'X-XSS-Protection', '1; mode=block');
    set(ctx, 'X-Content-Type-Options', 'nosniff');
    set(ctx, 'X-Download-Options', 'noopen');

    ctx.remove('X-Powered-By');
    set(ctx, 'X-Frame-Options', 'SAMEORIGIN');
  }


  function set(ctx, name, value) {
    if (opts[name] !== false) {
      ctx.set(name, value);
    }
  }
};


