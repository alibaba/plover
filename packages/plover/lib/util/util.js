'use strict';


const pathUtil = require('path');
const resolveFrom = require('resolve-from');

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
 * 检测否普通函数，非GenerationFunction或者AsyncFunction
 *
 * @param {Object} obj  - 对象
 * @return {Boolean}    - 是否为普通函数
 */
exports.isPureFunction = function(obj) {
  return obj && obj.constructor &&
    obj.constructor.name === 'Function';
}
