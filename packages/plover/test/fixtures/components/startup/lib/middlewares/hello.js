/**
 * function that return async function
 */
module.exports = function() {
  return async (ctx) => {
    ctx.body = 'hello';
  };
};

