'use strict';


/**
 * 渲染模块的一些帮助方法
 */

const util = require('util');
const escapeHtml = require('escape-html');
const is = require('is-type-of');
const arrayUtil = require('plover-util/lib/array');


const logger = require('plover-logger')('plover:core/render-helper');


const PLACE_HOLDER = '##PLOVER_' + Date.now() + '_';
const PADDING = '0000000000';
const INDEX_LEN = 10;
const SKIP_LEN = PLACE_HOLDER.length + INDEX_LEN;


/**
 * 异步渲染
 *
 * @param {RenderData}  rd    - 当前模块渲染数据
 * @param {Promise}     defer - 异步渲染Promise对象
 * @param {String}      url   - 可选，仅用于调试，用于not found时输出信息
 * @param {Boolean} development - 可选，是否开发态，仅用于调试
 * @return {String}             - 渲染结果，结果是个占位符
 */
exports.renderAsync = function(rd, defer, url, development) {
  logger.debug('render async for %s', url);
  // 标识有异步子模块
  rd.deferred = true;
  const depends = rd.depends;
  const output = PLACE_HOLDER + toFixed(depends.length);
  depends.push(exports.ensure(defer, url, development));
  return output;
};


function toFixed(index) {
  const str = PADDING + index;
  return str.substr(str.length - INDEX_LEN);
}


/**
 * 包装异步渲染Promise对象，确保渲染失败时不会影响父模块的渲染
 *
 * @param {Promise} defer     - 异步渲染对象
 * @param {String}  url       - 可选，同`renderAsync`
 * @param {Boolean} development   - 可选， 同`renderAsync`
 * @return {Promise}              - 包装结果
 */
exports.ensure = function(defer, url, development) {
  return new Promise(function(resolve) {
    defer.then(function(o) {
      if (!o) {
        url = url || '';
        logger.error('child view not found: %s', url);
        o = exports.notFound(url, development);
      }
      resolve(o);
    }, function(e) {
      e.url = url;
      resolve(exports.renderError(e, development));
    });
  });
};


/**
 * 渲染依赖模块
 * 目前实现是基于正则式替换
 *
 * @param {RenderData} rd      - 运行上下文
 * @param {String}     content - 内容
 * @return  {String}           - 渲染结果
 */
exports.renderChildren = function* (rd, content) {
  // 如果没有异步渲染模块，只需要合并assets
  if (!rd.deferred) {
    mergeAssets(rd, rd.depends);
    return content;
  }

  // 需要将非Promise结果转成Promise以方便后面统一yield
  const depends = rd.depends.map(depend => {
    return is.generator(depend) ? depend : Promise.resolve(depend);
  });

  const results = yield depends;
  mergeAssets(rd, results);
  return mergeDepends(rd, content, results);
};


/*
 * 将异步渲染的结果合并到当前模板
 */
function mergeDepends(rd, content, results) {
  let last = 0;
  let pos = content.indexOf(PLACE_HOLDER, last);
  let result = '';
  while (pos !== -1) {
    result += content.substring(last, pos);

    const index = +content.substr(pos + PLACE_HOLDER.length, INDEX_LEN);
    let o = results[index];
    // 允许延迟计算
    if (typeof o === 'function') {
      o = o(rd);
    }
    const child = o ? o.content : '';
    result += child;

    last = pos + SKIP_LEN;
    pos = content.indexOf(PLACE_HOLDER, last);
  }
  return result + content.substr(last);
}


// for test
exports.__test = {    // eslint-disable-line
  PLACE_HOLDER: PLACE_HOLDER,
  mergeDepends: mergeDepends
};


function mergeAssets(rd, results) {
  if (results.length) {
    for (const o of results) {
      o.assets && exports.mergeAssets(rd.assets, o.assets);
    }
  }
}


/**
 * 异常情况渲染
 * @param {Error}   e           - 异常
 * @param {Boolean} development - 是否开发状态
 * @return {RenderResult}       - 渲染结果
 */
exports.renderError = function(e, development) {
  logger.error(e);
  const content = development ?
    `<pre>${util.inspect(e) + '\n' + (e.stack || '')}</pre>` :
    `<div class="plover-render-error" style="display: none;" data-url="${e.url}"></div>`;
  return { content: content };
};


/**
 * notFound渲染
 * @param {String}  url          - 模块url
 * @param {Boolean} development  - 是否开发状态
 * @return {RenderResult}        - 渲染结果
 */
exports.notFound = function(url, development) {
  url = escapeHtml(url);
  const content = development ?
`<h2 style="color: red; border: 1px dotted #f00; margin: 2px; padding: 5px 10px;">
  Not Found: ${url}
</h2>` :
`<div class="plover-not-found" style="display: none" data-url="${url}"></div>`;
  return { content: content };
};


/**
 * 合并src中的资源到des
 * @param {Object} des  - 目标资源对象
 * @param {Object} src  - 源资源对象
 * @return {Object}     - 目标资源对象
 */
exports.mergeAssets = function(des, src) {
  if (!src) {
    return des;
  }

  for (const name in src) {
    const group = src[name];
    des[name] = des[name] || { css: [], js: [] };

    arrayUtil.pushAll(des[name].css, group.css);
    arrayUtil.pushAll(des[name].js, group.js);
  }

  return des;
};

