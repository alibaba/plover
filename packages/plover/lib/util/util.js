const pathUtil = require('path');
const resolveFrom = require('resolve-from');
const convert = require('koa-convert');
const lang = require('plover-util/lib/lang');
const pathToRegexp = require('path-to-regexp');

const depd = require('depd')('plover');


/* eslint no-prototype-builtins: 0 */


/**
 * 代理属性访问到指定方法
 *
 * @param {Object} obj   - 会在此对象上创建属性
 * @param {Oject}  names - 属性名称列表
 * @param {String} to    - 方法，默认为obj.$get
 */
exports.delegateGetters = function(obj, names, to) {
  to = to || obj.$get;
  names.forEach(name => {
    if (!obj.hasOwnProperty(name)) {
      Object.defineProperty(obj, name, {
        enumerable: true,
        get: function() {
          return to.call(this, name);
        }
      });
    }
  });
};


const rRelativePath = /^\./;


/**
 * 根据路径加载模块
 *
 * 如果是相对路径，则相对于应用目录加载
 * 否则就会加载应用依赖的模块
 *
 * @param {String} root  - 应用根目录
 * @param {String} path  - 路径
 * @return {Object}      - 已加载的模块
 */
exports.loadModule = function(root, path) {
  if (rRelativePath.test(path)) {
    path = pathUtil.join(root, path);
  } else if (!pathUtil.isAbsolute(path)) {
    path = resolveFrom(root, path);
  }
  return require(path);
};


/**
 * 转化中间件成标准格式
 *
 * @param {Application} app - Ploveration Application
 * @param {Function} mw     - 中间件对象
 * @param {Object} options  - 配置
 * @return {Middleware}     - 中间件函数
 */
exports.convertMiddleware = function(app, mw, options) {
  // 中间件是普通function时，需要初始化
  // 接口形式是middleware(config, koaapp, ploverapp)
  if (lang.isPureFunction(mw) && options.prepare !== false) {
    mw = mw(app.config, app.server, app.proto);
  }
  if (lang.isGeneratorFunction(mw)) {
    depd('support for generators will be removed in v4.');
    const name = mw.name;
    mw = convert(mw);
    mw.$name = name;
  }
  return mw;
};


exports.patternToRe = function(pattern) {
  if (pattern && typeof pattern === 'string') {
    return pathToRegexp(pattern.replace(/\/\*/g, '/(.*)'));
  }
  return pattern || null;
};
