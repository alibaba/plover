/* eslint no-underscore-dangle: 0 */

module.exports = function PloverMethod(ctx, next) {
  if (ctx.method === 'POST') {
    const method = ctx.headers['x-http-method-override'] ||
        ctx.request.body._method;
    if (method) {
      ctx.method = method.toUpperCase();
    }
  }
  return next();
};
