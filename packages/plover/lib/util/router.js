const parseQuery = require('querystring').parse;
const { pathToRegexp } = require('path-to-regexp');


const logger = require('plover-logger')('plover:util/router');


const FIELD_PREFIX = '_plover_';
const rNum = /^\d+$/;
const rParam = /^\$([-\w]+)$/;

// 规则 module/action?query
// 模块名可以包含namespace, 如 admin/user
const rRule = /^\/?([-\w/]+?)[#/:]([-\w]+)(?:\?(.*))?$/;


class Router {
  /**
   * 路由模块
   *
   * @constructor
   */
  constructor() {
    // list of:
    // {
    //    regexp: {RegExp}
    //    fields: [],
    //    queries: [],
    //    options: {}
    // }
    this.routes = [];
  }


  /**
   * 添加路由规则
   *
   * @param {String|RegExp} pattern - 用于url匹配的规则
   *  目前路由匹配是使用`path-to-regexp`这个库来实现的
   *  它可以很方便地将路径样式的字符串转换成正则表达式
   *
   * @param {String|Object} rule     - 定位的规则
   * @param {Object} options         - 额外的选项
   *  - method {String|Array} 只允许指定method
   */
  add(pattern, rule, options) {
    options = options || {};

    const keys = [];
    if (typeof pattern === 'string') {
      // 新版本(>=2.0.0)的path-to-regexp不支持*，为了兼容需要做下替换处理
      pattern = pattern.replace(/\/\*/g, '/(.*)');
    }
    const regexp = pathToRegexp(pattern, keys);
    const fields = [];
    const queries = [];

    const map = mapKeys(keys);

    rule = typeof rule === 'string' ? parseRule(rule) : rule;

    for (const name in rule) {
      const value = rule[name];
      if (name === 'query') {
        for (const k in value) {
          queries.push(getParam(map, k, value[k]));
        }
      } else {
        fields.push(getParam(map, name, value));
      }
    }

    keys.forEach((key, index) => {
      const name = key.name;
      if (rNum.test(name)) {
        return;
      }

      const o = { param: true, index: index + 1 };
      if (name.startsWith(FIELD_PREFIX)) {
        o.name = name.substr(FIELD_PREFIX.length);
        fields.push(o);
      } else {
        o.name = name;
        queries.push(o);
      }
    });

    const item = { regexp, fields, queries, options };
    logger.debug('add MATCH: %s\nRULE: %o\nINNER: %o', pattern, rule, item);
    this.routes.push(item);
  }


  /**
   * 将path路由成RouteInfo
   *
   * @param {String}  path    - 路径
   * @param {Object}  request - 选项
   *  - method 当前请求method
   *
   * @return {Object|null} - 路由信息
   *  - module  {String}
   *  - action  {String}
   *  - query   {Object}
   */
  route(path, request) {
    if (this.routes.length === 0) {
      return null;
    }

    const routes = this.routes;
    for (const item of routes) {
      logger.debug('try route rule: %s => %o', item.regexp, item);
      // 对规则进行一次正则匹配，成功后将不对后续的路由进行匹配
      if (verifyRequest(item, request)) {
        const match = item.regexp.exec(path);
        if (match) {
          return getRouteInfo(item, match);
        }
      }
    }

    return null;
  }
}


module.exports = Router;


/*
 * 将keys映射成map，方便参数索引获取
 */
function mapKeys(keys) {
  const map = {};
  keys.forEach((key, index) => {
    let name = key.name;
    if (rNum.test(name)) {
      name = '' + (+name + 1);   // path-to-regexp是从0开始的
    }
    map[name] = index + 1;
  });
  return map;
}


function getParam(map, name, value) {
  if (typeof value === 'string') {
    const match = rParam.exec(value);
    if (match) {
      const index = map[match[1]];
      if (index === undefined) {
        throw new Error(`invalid param ${name}: ${value}`);
      }
      return { name: name, param: true, index: index };
    }
  }

  return { name: name, param: false, value: value };
}


/*
 * 将字符串类似的rules转换成object类型
 *
 * @param {String}  rule
 * @return {Object}
 *  - module
 *  - action
 *  - query
 *  - ...
 */
function parseRule(rule) {
  const match = rRule.exec(rule);
  if (!match) {
    throw new Error('invalid rewrite rule: ' + rule);
  }

  const params = match[3] ? parseQuery(match[3]) : {};
  const result = {
    module: match[1],
    action: match[2],
    query: {}
  };

  for (const name in params) {
    if (name.startsWith(FIELD_PREFIX)) {
      result[name.substr(FIELD_PREFIX.length)] = params[name];
    } else {
      result.query[name] = params[name];
    }
  }

  return result;
}


/*
 * 测试是否允许访问
 * - method是否匹配
 */
function verifyRequest(item, request) {
  const method = item.options.method;
  if (!method || !request) {
    return true;
  }

  const current = request.method.toLowerCase();
  if (typeof method === 'string') {
    return current === method;
  }

  // for Array
  return method.indexOf(current) !== -1;
}


function getRouteInfo(item, match) {
  const route = {};
  const query = {};

  for (const o of item.fields) {
    route[o.name] = o.param ? match[o.index] : o.value;
  }

  for (const o of item.queries) {
    query[o.name] = o.param ? match[o.index] : o.value;
  }

  route.query = query;
  return route;
}

