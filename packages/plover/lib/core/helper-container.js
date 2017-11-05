const util = require('../util/util');

const logger = require('plover-logger')('plover:core/helper-container');


const RD = Symbol('rd');
const VIEW_RENDER = Symbol('viewRender');
const NAVIGATOR = Symbol('navigator');
const APP = Symbol('app');
const CACHE = Symbol('cache');

const initList = [];

class HelperContainer {
  /**
   * Helper容器，用于管理helper对象
   * 模板中只有用到某个helper才去构造
   *
   * @param {RenderData} rd         - 渲染环境
   * @param {ViewRender} viewRender - viewRender
   * @param {Navigator}  navigator  - navigator
   * @param {PloverApplication} app - plover app对象
   */
  constructor(rd, viewRender, navigator, app) {
    this[RD] = rd;
    this[VIEW_RENDER] = viewRender;
    this[NAVIGATOR] = navigator;
    this[APP] = app;
    this[CACHE] = null;

    for (const helper of initList) {
      helper.$init.call(this, rd, viewRender, navigator, app);
    }
  }
}


function get(name) {
  const cache = this[CACHE] || (this[CACHE] = new Map());
  let helper = null;
  if (cache.has(name)) {
    helper = cache.get(name);
  } else {
    helper = HelperContainer.helpers[name];
    if (typeof helper === 'function') {
      logger.debug('create helper object: %s', name);
      const Helper = helper;
      helper = new Helper(
        this[RD], this[VIEW_RENDER],
        this[NAVIGATOR], this[APP]
      );
    }
    cache.set(name, helper);
  }
  return helper;
}


module.exports = HelperContainer;


HelperContainer.refine = function(app) {
  HelperContainer.helpers = app.helpers;
  const names = Object.keys(app.helpers);

  util.delegateGetters(HelperContainer.prototype, names, get);

  for (const name of names) {
    const helper = app.helpers[name];
    if (typeof helper.$init === 'function') {
      initList.push(helper);
    }
  }
};

