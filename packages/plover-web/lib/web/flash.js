const KEY = 'plover-flash';
const FLASH = Symbol(KEY);


module.exports = function(app) {
  Object.defineProperty(app.context, 'flash', {
    get: function() {
      return this[FLASH];
    }
  });


  return async function PloverFlash(ctx, next) {
    ctx[FLASH] = ctx.session[KEY] || {};
    delete ctx.session[KEY];

    await next();

    if (ctx.status === 302) {
      ctx.session[KEY] = ctx[FLASH];
    }
  };
};
