

const assert = require('assert');
const fs = require('fs');
const pathUtil = require('path');

const util = require('./util');


const rNamespace = /^@[-\w]+\//;


/**
 * 取得模块基本信息
 *
 * @param {String}  path     - 模块路径
 * @param {Object}  options  - 可选参数
 *  - ensure    需要验证package.json plover属性必须存在
 *  - namespace 匿名模块名字空间
 * @return {Object}          - 模块基本信息
 *  - name
 *  - version
 *  - path
 */
module.exports = function(path, options) {
  if (!util.isDir(path) || util.isEmptyDir(path)) {
    return null;
  }

  options = options || {};
  if (options.ensure && !util.isPloverModule(path)) {
    return null;
  }

  return getFromPackage(path) || getFromDeduce(path, options);
};


function getFromPackage(path) {
  const pkgPath = pathUtil.join(path, 'package.json');
  // 根据package.json生成基本信息
  if (!fs.existsSync(pkgPath)) {
    return null;
  }

  const o = readJson(pkgPath);
  const info = o.plover || {};

  // plover.name配置了就使用它，否则从name属性去掉名字空间得到
  info.name = info.name || o.name.replace(rNamespace, '');
  info.version = info.version || o.version || '0.0.0';
  info.path = path;

  assert(info.name, 'name required');

  return info;
}


function getFromDeduce(path, options) {
  const info = {
    name: pathUtil.basename(path),
    version: '0.0.0',
    path: path
  };

  const namespace = options.namespace;
  if (namespace) {
    info.name = namespace + '/' + info.name;
    info.namespace = namespace;
  }

  return info;
}


function readJson(path) {
  const body = fs.readFileSync(path, 'utf-8');
  try {
    return JSON.parse(body);
  } catch (e) {
    throw new Error('invalid json file: ' + path);
  }
}

