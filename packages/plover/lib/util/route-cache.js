const assign = require('plover-util/lib/assign');

const logger = require('plover-logger')('plover:util/route-cache');


class RouteCache {
  /**
   * 用于缓存路由规则
   * cache规则见`#set(path, route)`
   *
   * @constructor
   * @param {PloverApplication} app  - Plover应用对象
   */
  constructor(app) {
    // 模块解析器
    this.moduleResolver = app.moduleResolver;

    // 最大cache数量
    this.maxCacheSize = app.settings.maxRouteCacheSize || 30;

    this.nameMap = new Map();  // 一个模块的action数量
    this.keyMap = new Map();   // action cache的数量
    this.cache = new Map();
  }


  /**
   * 尝试从cache获得route信息
   *
   * @param {String} path - 路径
   * @return {Object}     - route信息
   */
  get(path) {
    let route = this.cache.get(path);
    if (route) {
      logger.debug('route found from cache: %s', path);
      route = clone(route);
    }
    return route;
  }


  /**
   * 尝试将route信息存放到cache中
   *
   * 1. 不存在的模块route不缓存
   * 2. 每个模块的action数量不超过maxCacheSize
   * 3. 某个action的cache数量不超过maxCacheSize
   *
   * @param {String} path   - 路径
   * @param {Object} route  - 路由信息
   * @return {Boolean}      - 是否cache成功
   */
  /* eslint complexity: [2, 10] */
  set(path, route) {
    // 不存在的模块不cache，否则大量无效访问(可能是攻击会干扰正常cache逻辑)
    const info = this.moduleResolver.resolve(route.module);
    if (!info) {
      return false;
    }

    // 当前模块已缓存的action数量
    let actionCount = this.nameMap.get(route.module) || 0;

    const key = route.module + '.' + route.action;

    // 当前action已缓存的数量，即不同的url可以路由到同一个action
    let count = this.keyMap.get(key) || 0;
    if (count === 0) {
      // 缓存的是新的action
      actionCount++;
    } else if (count >= this.maxCacheSize) {
      // 这个route不再支持cache
      // 清除已cache的项
      count = -1;
      logger.info('clean cache: %s', key);
      cleanCache(this, route);
    } // else 新的url, 但是action缓存已存在, 且数量在限制范围内

    let success = false;
    // 以下两种情况需要cache
    // 1. 新的action，且这个模块缓存的action数量没超标
    // 2. 当前action缓存的次数没有超标
    if (count === 0 && actionCount <= this.maxCacheSize ||
        count !== -1) { // -1 是在上面第二个分支中设置的
      count++;
      logger.info('cache route for: %s', path);
      this.cache.set(path, clone(route));
      success = true;
    }

    this.nameMap.set(route.module, actionCount);
    this.keyMap.set(key, count);

    return success;
  }
}


module.exports = RouteCache;


/*
 * clone一个route项
 */
function clone(route) {
  route = assign({}, route);
  route.query = assign({}, route.query);
  return route;
}


/*
 * 清除不再缓存的action
 */
function cleanCache(self, route) {
  const cache = self.cache;
  const list = [];
  for (const k of cache.keys()) {
    const item = cache.get(k);
    if (item.module === route.module &&
        item.action === route.action) {
      list.push(k);
    }
  }

  for (const k of list) {
    cache.delete(k);
  }
}

