'use strict';


const fs = require('fs');
const pathUtil = require('path');

const util = require('./util');

const getBaseInfo = require('./get-module-base-info');


/**
 * 取得模块信息
 *
 * @param {String} path    - 模块路径
 * @param {Object} options - 可选参数
 *  - ensure    需要验证package.json plover属性必须存在
 *  - namespace 匿名模块名字空间
 * @return {Object}        - 模块信息
 *  - name          名称
 *  - version       版本
 *  - path          模块所在路径
 *  - views         视图资源
 *  - assetsRoot    前端资源根目录
 */
module.exports = function(path, options) {
  const info = getBaseInfo(path, options);
  if (!info) {
    return null;
  }

  const aroot = pathUtil.join(path, 'assets');
  const vroot = pathUtil.join(path, 'views');

  if (fs.existsSync(aroot)) {
    info.assets = true;
    info.assetsRoot = 'assets/';
  } else if (info.assets) { // 纯assets仓库
    info.assetsRoot = '';
  }

  const assets = loadAssets(aroot);
  info.views = loadViews(path, vroot, assets);

  return info;
};


function loadAssets(aroot) {
  const jsroot = pathUtil.join(aroot, 'js');
  const cssroot = pathUtil.join(aroot, 'css');

  const jslist = util.scan(jsroot);
  const csslist = util.scan(cssroot);

  return {
    js: mapFiles(aroot, jsroot, jslist, '.js'),
    css: mapFiles(aroot, cssroot, csslist, '.css')
  };
}


const rExt = /\.\w+?$/;

/*
 * 根据前端文件列表
 *
 * @param {String} aroot  - assets root
 * @param {String} rpath  - js或css目录地址
 * @param {Array}  list   - 前端资源文件列表
 * @param {String} extA   - 扩展名
 *
 * @return {Object}       - 名称->相对地址映射表，比如
 *  {
 *    view: 'js/view.js',
 *    edit: 'js/edit.js',
 *    'elements/item': 'js/elements/item.js'
 *  }
 */
function mapFiles(aroot, rpath, list, ext) {
  const map = {};
  for (const path of list) {
    const name = getName(rpath, path);
    map[name] = regularPath(pathUtil.relative(aroot, path)).replace(rExt, ext);
  }
  return map;
}


/**
 * 加载视图信息
 *
 * @param {String} root   - 模块根目录
 * @param {String} vroot  - 视图根目录，一般为views/
 * @param {String} assets - 前端资源信息
 *
 * @return {Object}       - 视图信息
 *  {
 *    view: {
 *      template: 'views/view.art',
 *      js: 'js/view.js',
 *      css: 'css/view.css'
 *    }
 *  }
 */
function loadViews(root, vroot, assets) {
  const views = {};
  const list = util.scan(vroot);
  for (const vpath of list) {
    const name = getName(vroot, vpath);
    views[name] = {
      template: regularPath(pathUtil.relative(root, vpath)),
      js: assets.js[name],
      css: assets.css[name]
    };
  }
  return views;
}


/**
 * 取得相对路径作为名称
 * @param {String} rpath  - 父路径
 * @param {String} path   - 路径
 * @return {String}       - path当对于rpath的路径
 */
function getName(rpath, path) {
  path = pathUtil.relative(rpath, path);
  return path.replace(/\..*$/, '').replace(/\\/g, '/');
}


/*
 * 统一路径分隔符
 */
function regularPath(path) {
  return path.replace(/\\/g, '/');
}
