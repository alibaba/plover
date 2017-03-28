'use strict';


/* eslint no-underscore-dangle: 0 */

module.exports = function PloverMethod(ctx, next) {
  const method = ctx.request.body._method;
  if (method && ctx.method === 'POST') {
    ctx.method = method.toUpperCase();
  }
  return next();
};
