/**
 * function that return async function
 */
module.exports = function() {
  return async (ctx, next) => {
    ctx.body = ctx.body + ' & b';
    await next();
  };
};

