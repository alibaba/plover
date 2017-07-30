'use strict';


const fs = require('fs');
const pathUtil = require('path');
const resolveFrom = require('resolve-from');

const util = require('./util');
const getModuleInfo = require('./get-module-info');
const vertify = require('./vertify');


const debug = require('debug')('plover-module-resolver');


/* global setTimeout, clearTimeout */
/* eslint no-underscore-dangle: 0 */


class Resolver {
  /**
   * 用于解析和加载应用中的模块
   *
   * 应用启动时就会构造此对象，
   * 期望构造函数中遍历缓存所有plover模块信息，
   * 这样在调用resolve方法时就可以直接从cache中获取，不会发生IO操作
   *
   * 可以通过`modulesDir`和`libModulesDir`两个参数指定模块所在位置。
   * 默认情况下：
   *  `modulesDir`为应用根目录下的`modules`目录
   *  `libModulesDir`为应用目录。框架根据`libModulesDir`的dependencies中查找plover模块
   *
   * 其中modulesDir和libModulesDir可以配置为`Array`以适应于复杂应用的情况，见下面参数说明
   *
   * @constractor
   *
   * @param {Object} settings - 配置信息
   *  - applicationRoot {String}  - 应用程序根目录
   *  - modulesDir      {Object}  - 应用模块目录
   *  {
   *    // 默认名字空间的模块
   *    default: pathUtil.join(__dirname, '../modules'),
   *    // 加载后如果没有特别指定(package.json)，模块名字会有`tpl/`前缀
   *    tpl: pathUtil.join(__dirname, '../tpl-modules')
   *  }
   *
   *  - libModulesDir   {Array}   - 库模块目录
   *
   *  - development {Boolean}     - 是否开发态
   */
  constructor(settings) {
    // 是否开发态
    this._development = settings.development;

    // 模块Map
    this._modules = new Map();

    // 用于开发模式下控制是否重新加载模块
    this._timerCache = new Map();

    // 应用根目录
    const root = settings.applicationRoot;

    // 加载库模块
    loadLibModules(this, root, settings);

    // 加载应用模块
    loadAppModules(this, root, settings);
  }


  /**
   * 根据名称取得模块信息
   * 在开发环境时每次都重新读取模块信息, 在生产环境时直接从cache中获取
   *
   * @param  {String} name    - 模块名称
   * @return {ModuleInfo}     - 模块信息
   */
  resolve(name) {
    const modules = this._modules;
    // 非开发环境直接从cache中获取
    if (!this._development) {
      return modules.get(name);
    }

    const cache = this._timerCache;
    let timer = cache.get(name);
    if (timer) {
      // 刚刚加载过就别重新加载了，基本上一个请求内相同模块只会加载一次
      clearTimeout(timer);
    } else {
      reloadModule(this, name);
    }

    timer = setTimeout(function() {
      cache.delete(name);
    }, Resolver.CACHE_TIMEOUT);
    cache.set(name, timer);

    return modules.get(name);
  }


  /**
   * 取得应用中的模块列表
   *
   * @return {Array<ModuleInfo>} - 模块列表
   */
  list() {
    return Array.from(this._modules.values());
  }


  /**
   * 从目录加载模块信息
   *
   * @param {String}  path    - 目录
   * @param {Options} options - 可选参数
   *  - namespace 匿名模块的名字空间
   *  - ensure    检查package.json中的plover属性必须存在
   *  - silent    如果path是无效模块，是忽略还是抛出现异常
   */
  loadModule(path, options) {
    options = options || {};
    const info = getModuleInfo(path, options);
    if (!info) {
      if (options.silent) {
        return;
      }
      throw new Error('invalid module: ' + path);
    }

    tryPushInfo(this._modules, info);
  }


  /**
   * 添加模块到resolver
   * @param {Object} info - 模块信息
   */
  pushModule(info) {
    tryPushInfo(this._modules, info);
  }


  /**
   * 验证模块依赖是否兼容, 如果有问题则会抛出Error
   */
  vertify() {
    vertify(this._modules);
  }
}
//~ Resolver


Resolver.CACHE_TIMEOUT = 3000;


module.exports = Resolver;


/**
 * 重新加载模块
 * @param {Object} self - self
 * @param {String} name - 模块名
 */
function reloadModule(self, name) {
  const map = self._modules;
  const info = map.get(name);
  if (info && info.reload !== false) {
    map.delete(name);
    debug('reload module: %s', name);
    self.loadModule(info.path, { namespace: info.namespace });
  }
}


/*
 * 加载库模块
 */
function loadLibModules(self, root, settings) {
  let libs = settings.libModulesDir || root;
  if (!Array.isArray(libs)) {
    libs = [libs];
  }

  for (const libPath of libs) {
    const map = loadLibModulesMap(libPath);
    for (const name of map.keys()) {
      self._modules.set(name, map.get(name));
    }
  }
}


function loadLibModulesMap(libPath) {
  debug('load lib modules: %s', libPath);
  const map = new Map();

  const pkgPath = pathUtil.join(libPath, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    debug(`${pkgPath} not exists, ignore`);
    return map;
  }

  const pkgInfo = require(pkgPath);
  const deps = Object.assign({}, pkgInfo.dependencies, pkgInfo.devDependencies);
  for (const name in deps) {
    const path = resolveFrom(libPath, name + '/package.json');
    if (path) {
      const moduleRoot = pathUtil.dirname(path);
      const info = getModuleInfo(moduleRoot, { ensure: true });
      tryPushInfo(map, info);
    }
  }
  return map;
}


/**
 * 加载应用模块
 *
 * 默认情况下加载应用目录下的`modules`目录
 *
 * @param {Object} self     - self
 * @param {String} root     - 应用根目录
 * @param {Object} settings - 配置
 * {
 *  modulesDir: {Object<String, String>}  模块组:模块路径
 *  {
 *    default: ...
 *  }
 * }
 */
function loadAppModules(self, root, settings) {
  let modulesDir = settings.modulesDir || pathUtil.join(root, 'modules');
  if (typeof modulesDir === 'string') {
    modulesDir = { default: modulesDir };
  }

  const map = new Map();

  for (const ns in modulesDir) {
    const modulesRoot = modulesDir[ns];
    debug('load app modules: %s, %s', ns, modulesRoot);
    const dirs = getModuleDirs(modulesRoot);
    const namespace = ns === 'default' ? null : ns;
    for (const dir of dirs) {
      const info = getModuleInfo(dir, { namespace: namespace });
      tryPushInfo(map, info);
    }
  }

  for (const name of map.keys()) {
    self._modules.set(name, map.get(name));
  }
}


const rModuleName = /^\w/;

/**
 * 取得文件夹下现的模块目录
 *
 * @param {String} path - 模块文件夹，如`/home/admin/work/myapp/modules`
 * @return {Array}      - 目录列表
 */
function getModuleDirs(path) {
  const dirs = util.isDir(path) ? fs.readdirSync(path) : [];
  return dirs.filter(name => rModuleName.test(name))
            .map(name => pathUtil.join(path, name));
}


/**
 * 将模块信息入到map中，检查模块名是否冲突
 *
 * @param {Map} map     - Map
 * @param {Object} info - 模块信息
 */
function tryPushInfo(map, info) {
  if (!info) {
    return;
  }

  if (map.has(info.name)) {
    const path = map.get(info.name).path;
    throw new Error(`module conflict: ${info.name}, ${info.path}, ${path}`);
  }

  debug('load module: %s -> %s', info.name, info.path);
  map.set(info.name, info);
}

