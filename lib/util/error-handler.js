/**
 * 错误处理中间件
 */

'use strict';


const util = require('util');

const logger = require('plover-logger')('plover:util/error-handler');


module.exports = function(config) {
  const development = (config || {}).env === 'development';

  return function* errorHandler(next) {
    try {
      yield* next;
    } catch (e) {
      const status = e.status || 500;
      // 只处理500及以上的异常
      if (status < 500) {
        throw e;
      }

      logger.error(e);
      this.status = status;

      const message = development ?
          '<pre>' + util.inspect(e) + '\n' + (e.stack || '') + '</pre>' :
          'Internel Server Error';
      this.body = message;
    }
  };
};

