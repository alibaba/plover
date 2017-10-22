const assert = require('assert');
const pathUtil = require('path');
const fs = require('mz/fs');
const sortBy = require('lodash/sortBy');
const lang = require('plover-util/lib/lang');
const util = require('./util/util');


const Handlers = [];


/**
 * 添加一个处理器
 *
 * @param {String}    type      - 资源类型，如js, css等
 * @param {String}    ext       - 资源扩展名，带.
 * @param {Function}  handler   - 处理器函数
 * @param {Number}    order     - 排序，默认为3
 */
exports.add = function(type, ext, handler, order) {
  order = typeof order === 'number' ? order : 3;
  Handlers.push({ type: type, ext: ext, handler: handler, order: order });
};


/**
 * 尝试找到path对应的文件并编译
 * 用在请求一定的url上
 *
 * @param   {String}  path     - 资源路径
 * @param   {Object}  info     - 当前模块信息
 * @param   {Object}  options  - 额外的信息
 *  {
 *    settings: {Object}    配置
 *    moduleResolver: {ModuleResolver} 模块解析器
 *  }
 * @return  {String|false}     - 编译结果或false
 */
exports.filter = function* (path, info, options) {
  options = yield* prepareOptions(info, options);
  if (options.buildConfig.enable === false) {
    return false;
  }

  const handlers = sortBy(Handlers, 'order');
  for (const o of handlers) {
    if (o.type === pathUtil.extname(path).substr(1)) {
      const result = yield* performFilter(path, info, options, o);
      if (result) {
        return result.code;
      }
    }
  }

  return false;
};


const rExt = /(\.\w+)$/;

function* performFilter(path, info, options, o) {
  const thispath = path.replace(rExt, o.ext);
  if (yield fs.exists(thispath)) {
    const body = yield fs.readFile(thispath, 'utf-8');
    const result = lang.isGeneratorFunction(o.handler) ?
      yield* o.handler(thispath, body, info, options) :
      o.handler(thispath, body, info, options);
    return regularResult(result);
  }

  return false;
}


/**
 * 对指定文件进行编译
 *
 * @param   {String}  path    - 资源路径
 * @param   {Object}  info    - 当前模块信息
 * @param   {Object}  options - 额外的信息
 * @return  {String|false}    编译结果或false
 */
exports.compile = function* (path, info, options) {
  options = yield* prepareOptions(info, options);
  if (options.buildConfig.enable === false) {
    return false;
  }

  options.compile = true;   // 标识是编译过程，handler可能有不同行为
  const handlers = sortBy(Handlers, 'order');
  for (const o of handlers) {
    if (pathUtil.extname(path) === o.ext) {
      const body = yield fs.readFile(path, 'utf-8');
      let result = lang.isGeneratorFunction(o.handler) ?
        yield* o.handler(path, body, info, options) :
        o.handler(path, body, info, options);
      result = regularResult(result);
      if (result) {
        result.type = o.type;
        return result;
      }
    }
  }

  return false;
};


/*
 * 对参数处理，需要取得模块相关的构建信息
 */
function* prepareOptions(info, options) {
  options = Object.assign({}, options);
  options.buildConfig = yield util.loadBuildConfig(info);
  return options;
}


/*
 * 原来编译结果是`string`, 后来为了添加sourcemap，将结果变成`object`
 * 这里对结果进行规范化，即支持`string`又支持`object`
 */
function regularResult(result) {
  if (typeof result === 'string') {
    result = { code: result };
  }
  if (result) {
    assert(typeof result === 'object' && ('code' in result),
      'invalid assert result, it should be typeof object with prop `code`');
  }
  return result;
}

