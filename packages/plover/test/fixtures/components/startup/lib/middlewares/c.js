/**
 * function that return regular function
 */
module.exports = function() {
  return (ctx, next) => {
    ctx.body = ctx.body + ' & c';
    return next();
  }
};

