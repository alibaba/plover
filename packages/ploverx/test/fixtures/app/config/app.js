const pathUtil = require('path');


/**
 * 服务器相关配置
 */
/*
exports.server = {
  // http server启动端口号
  port: 4000
};
*/


/**
 * 日志配置
 */
exports.loggers = {
  system: {
    match: /^plover/,
    level: 'info',
    consoleLevel: 'warn',
    file: pathUtil.join(__dirname, '../logs/plover.log'),
    errorFile: pathUtil.join(__dirname, '../logs/plover-error.log')
  },

  app: {
    level: 'info',
    consoleLevel: 'info',
    file: pathUtil.join(__dirname, '../logs/app.log'),
    errorFile: pathUtil.join(__dirname, '../logs/app-error.log')
  }
};


/**
 * 服务
 */
exports.services = {
};


/**
 * 模板帮助方法
 */
exports.helpers = {
};


/**
 * web中间件相关配置
 */
exports.web = {
  // 用于设置app.keys, 实际应用需要重新产生一个
  // http://koajs.com/#app.keys
  keys: ['17e6b6bc6129097383dcad4fa1602233'],

  // https://github.com/koajs/favicon
  favicon: pathUtil.join(__dirname, '../public/favicon.ico'),

  // https://github.com/koajs/response-time
  rtime: {},

  static: {}
};


/**
 * 安全相关配置
 */
exports.security = {
};


/**
 * plover-assets插件相关配置
 */
exports.assets = {
  // 是否启用plover-assets中间件模块
  // 启动时静态资源由plover应用处理
  // 用于不将前端资源交给cdn处理的简单应用场景
  // 在开发模式下总是开启的，方便开发。
  enableMiddleware: true,

  // 是否开启urlConcat功能，生效于非开发环境
  enableConcat: true,

  // 当打开urlConcat功能时使用
  concatItems: [
    { match: /^\/g\/(.*)$/, prefix: '/g/??' }
  ]
};
