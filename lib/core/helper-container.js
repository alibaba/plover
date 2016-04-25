'use strict';


const util = require('../util/util');

const logger = require('plover-logger')('plover:core/helper-container');


const CACHE = Symbol('cache');


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
    this.$rd = rd;
    this.$viewRender = viewRender;
    this.$navigator = navigator;
    this.$app = app;
    this[CACHE] = new Map();
  }


  $get(name) {
    const cache = this[CACHE];
    let helper = null;
    if (cache.has(name)) {
      helper = cache.get(name);
    } else {
      helper = HelperContainer.helpers[name];
      if (typeof helper === 'function') {
        logger.debug('create helper object: %s', name);
        const Helper = helper;
        helper = new Helper(this.$rd, this.$viewRender,
            this.$navigator, this.$app);
      }
      cache.set(name, helper);
    }
    return helper;
  }
}


module.exports = HelperContainer;


HelperContainer.refine = function(app) {
  HelperContainer.helpers = app.helpers;
  const names = Object.keys(app.helpers);

  util.delegateGetters(HelperContainer.prototype, names);

  for (const name of names) {
    const helper = app.helpers[name];
    if (helper.$proto) {
      Object.assign(HelperContainer.prototype, helper.$proto);
    }
  }
};

