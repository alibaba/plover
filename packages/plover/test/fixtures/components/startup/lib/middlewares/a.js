/**
 * async function
 */
module.exports = async (ctx, next) => {
  ctx.body = 'a';
  await next();
};
