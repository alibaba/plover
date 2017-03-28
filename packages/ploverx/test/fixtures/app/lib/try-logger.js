const logger = require('plover-logger')('my:lib/hello');


module.exports = function() {
  logger.info('init try-logger middleware');
  return async (ctx, next) => {
    if (ctx.path === '/logger') {
      const level = ctx.query.level || 'info';
      logger[level]('some logger message');
      ctx.body = `logger ${level}`;
    } else {
      await next();
    }
  };
};
