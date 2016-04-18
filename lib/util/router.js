'use strict';


const parseQuery = require('querystring').parse;
const pathToRegexp = require('path-to-regexp');


const logger = require('plover-logger')('plover:util/router');


const rNum = /^\d+$/;


class Router {

  /**
   * 路由模块
   *
   * @constructor
   */
  constructor() {
    this.routes = [];
  }


  /**
   * 添加路由规则
   *
   * @param {String|RegExp} pattern - 用于url匹配的规则
   *  目前路由匹配是使用`path-to-regexp`这个库来实现的
   *  它可以很方便地将路径样式的字符串转换成正则表达式
   *
   * @param {String} rule - 定位的规则
   */
  add(pattern, rule) {
    const keys = [];

    const item = {
      // 使用它进行路径匹配
      regexp: pathToRegexp(pattern, keys),
      // 匹配后动态参数的名称
      keys: keys,
      // 解析后的规则
      rule: parseRule(rule)
    };

    for (const key of keys) {
      // 标识无名参数(使用数字索引)
      key.unnamed = rNum.test(key.name);
    }

    logger.info('add route: %s => %o', item.regexp, item.rule);

    this.routes.push(item);
  }


  /**
   * 将path路由成RouteInfo
   *
   * @param {String}  path - 路径
   * @return {Object|null} - 路由信息
   *  - module  {String}
   *  - action  {String}
   *  - query   {Object}
   */
  route(path) {
    if (this.routes.length === 0) {
      return null;
    }

    const routes = this.routes;
    for (const item of routes) {
      logger.debug('try route rule: %s => %o', item.regexp, item.rule);
      // 对规则进行一次正则匹配，成功后将不对后续的路由进行匹配
      const match = item.regexp.exec(path);
      if (match) {
        return getRouteInfo(item, match);
      }
    }

    return null;
  }
}


module.exports = Router;


// 规则 module/action?query
// 模块名可以包含namespace, 如 admin/user
const rRule = /^\/?([-\w\/]+?)[\/:]([-\w]+)(?:\?(.*))?$/;

// 匹配前缀为$的参数值(动态参数)
const rParam = /^\$/;


/*
 * 将定位规则解析成结构方便后续路由
 */
function parseRule(rule) {
  const match = rRule.exec(rule);
  if (!match) {
    throw new Error('invalid rewrite rule: ' + rule);
  }

  const params = {};  // 缓存rule中动态参数列表
  const query = match[3] ? parseQuery(match[3]) : {};
  for (const name in query) {
    const value = query[name];
    // 前缀为$的是动态参数
    if (rParam.test(value)) {
      params[name] = value.substr(1); // 去掉前面的$
    }
  }

  return {
    module: match[1], // 模块名
    action: match[2], // Action名
    query: query,     // 参数列表
    params: params    // 动态参数列表
  };
}


/*
 * 解析匹配结果成路由信息
 *
 * 路由信息包括
 *  module: 模块名称
 *  action: Action名称
 *  query: 请求参数
 *  包含 **匹配规则** 中匹配的参数信息和 **定位规则** 中的参数信息
 *
 *  从匹配规则或定位规则获取的参数，如果名称是_plover_带头的，则作为特殊参数直接添加到路由规则中
 *  这样就可以使用:_plover_module和:_plover_action很方便地进行动态路由了
 */
function getRouteInfo(item, match) {
  const info = {};
  const rule = item.rule;

  // 规则中可能设置了module和action，可以被后续_plover参数替换
  info.module = rule.module;
  info.action = rule.action;
  info.query = {};

  // 访问匹配结果, map中为所有参数信息
  const map = visitMatch(match, item.keys, info);

  const params = rule.params;    // 动态参数map, 如 { offerId: '1' }  // 已去掉$
  const ruleQuery = rule.query;  // 定位规则中的参数map
  for (const name in ruleQuery) {
    let value = ruleQuery[name];
    // 如果是动态参数, 就尝试从map(来自url路由结果)中取
    // 否则直接从使用定位规则中的参数
    if (params[name]) {
      value = map[params[name]] || '';
    }
    setQueryItem(info, name, value);
  }

  return info;
}

/*
 * 访问匹配结果
 * 1. 根据匹配规则中的keys，将具名参数值填充到info结构中
 * 2. 将所有参数和到map中返回，给后续定位规则使用
 *
 * @param {Array} match - 正则式匹配结果
 * @param {Array} keys  - 用于引用匹配组
 * @param {Object} info - 路由信息
 * @return {Object}     - url路由后的参数信息
 */
function visitMatch(match, keys, info) {
  const map = {};
  for (let i = 0, c = keys.length; i < c; i++) {
    const key = keys[i];
    let name = key.name;
    if (key.unnamed) {
      // 匿名参数以0开始, 处理成以1开始, 和正则式一致方便rule中使用
      name = '' + (+name + 1);
    } else {
      // 设置路由参数
      setQueryItem(info, name, match[i + 1]);
    }
    // 参数存在map中, 动态参数会使用到
    map[name] = match[i + 1];
  }
  return map;
}


const prefix = '_plover_';

function setQueryItem(info, name, value) {
  const index = name.indexOf(prefix);
  if (index === 0) {
    // 自定义的route参数，去掉前缀_plover_存起来，用于扩展
    info[name.substr(prefix.length)] = value;
  } else {
    info.query[name] = value;
  }
}

