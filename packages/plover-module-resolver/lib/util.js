

const pathUtil = require('path');
const fs = require('fs');


/**
 * 判断是否plover模块
 * 在package.json中有plover配置信息，就认为是plover模块
 *
 * @param {String} path - 目录
 * @return {Boolean}    - 是否plover模块
 */
exports.isPloverModule = function(path) {
  const pkgpath = pathUtil.join(path, 'package.json');
  if (fs.existsSync(pkgpath)) {
    const pinfo = require(pkgpath);
    return !!(pinfo && pinfo.plover);
  }
  return false;
};


/**
 * 判断是否目录
 *
 * @param {String} path - 路径
 * @return {Boolean}    - 是否目录
 */
exports.isDir = function(path) {
  return fs.existsSync(path) && fs.statSync(path).isDirectory();
};


/**
 * 判断是否空目录
 *
 * @param {String} path - 路径
 * @return {Boolean}    - 是否目录
 */
exports.isEmptyDir = function(path) {
  const files = fs.readdirSync(path);
  for (const file of files) {
    if (/^[-\w]/.test(file)) {
      return false;
    }
  }
  return true;
};


/**
 * 深度优先遍历出文件夹中的文件，忽略隐藏文件
 *
 * @param  {String} path   - 目录
 * @return {Array<String>} - 文件列表
 */
exports.scan = function(path) {
  const list = [];
  if (!exports.isDir(path)) {
    return list;
  }

  const files = fs.readdirSync(path);
  for (const file of files) {
    if (!file.startsWith('.')) {
      const thispath = pathUtil.join(path, file);
      const stat = fs.statSync(thispath);
      if (stat.isFile()) {
        list.push(thispath);
      } else { // directory
        list.push.apply(list, exports.scan(thispath));
      }
    }
  }

  return list;
};

