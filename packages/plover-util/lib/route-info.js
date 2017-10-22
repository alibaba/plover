

const re = /^([^#:]+)[#:](.+)$/;


/**
 * 解析url构造一个route信息，用于定位一个资源
 *
 * @param {Object} parent  - 父route信息
 * @param {String} url     - 路径
 * @return {Object}        - route信息
 *  - module
 *  - action
 */
exports.parse = function(parent, url) {
  const route = {};
  const match = re.exec(url);
  if (match) {
    route.module = match[1];
    route.action = match[2];
  } else {
    route.module = parent.module;
    route.action = url;
  }

  route.parent = parent;
  route.root = parent.root;

  return exports.regular(route);
};


/**
 * 规范化route对象
 * @param {Object} route - route信息
 * @return {Object}      - 规范后的route信息
 */
exports.regular = function(route) {
  route.action = route.action || 'view';
  route.url = route.module + ':' + route.action;
  return route;
};

