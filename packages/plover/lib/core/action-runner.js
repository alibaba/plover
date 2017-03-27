'use strict';


const assert = require('assert');
const lang = require('plover-util/lib/lang');
const invoker = require('../util/invoker');

const logger = require('plover-logger')('plover:core/action-runner');


class ActionRunner {

  /**
   * 用于运行控制器Action方法
   *
   * 控制器中暴露的方法被称为`Action`
   * 此类被`Navigator`使用，一个`Navigator`对象包含一个`ActionRunner`
   *
   * @param {PloverApplication} app - Plover应用对象
   * @param {Navigator} navigator   - Navigator对象
   *  - filters {Array}  - Filter列表
   */
  constructor(app, navigator) {
    this.filters = navigator.filters;
  }


  /**
   * 运行`Action`方法
   *
   * 1. 首先顺序遍历运行filters中的`beforeAction`方法
   * 2. 再运行当前控制器`beforeAction`方法
   * 3. 运行控制器Action方法
   * 4. 运行当前控制器`afterAction`方法
   * 5. 逆序遍历运行`afterAction`方法
   *
   * @param {NavigateData}  rd   - NavigateData
   * @param {ActionContext} ctx  - 上下文，即`Action`中可以使用的`this`
   * @return {Any}        - 运行结果
   */
  * run(rd, ctx) {
    const filters = this.filters;
    const route = rd.route;
    let ret = null;

    logger.debug('run action: %s[%s]', route.module, route.action);

    if (filters.length) {
      ret = yield* invoker.filter(filters, 'beforeAction', ctx);
      if (invoker.isSuccess(ret)) {
        return ret;
      }
    }

    ret = yield* runAction(rd, ctx);
    if (invoker.isSuccess(ret)) {
      return ret;
    }

    if (filters.length) {
      return yield* invoker.filter(filters, 'afterAction', ctx, true);
    }

    return ret;
  }
}


module.exports = ActionRunner;


/* eslint complexity: [2, 9] */
function* runAction(rd, ctx) {
  const module = rd.module;
  let ret = null;
  let fn = module.beforeAction;

  if (fn) {
    ret = lang.isGeneratorFunction(fn) ? yield* fn.call(ctx, ctx) : fn.call(ctx, ctx);
    if (invoker.isSuccess(ret)) {
      return ret;
    }
  }

  fn = module[rd.route.action];
  assert(fn, 'action method should exists');
  ret = lang.isGeneratorFunction(fn) ? yield* fn.call(ctx, ctx) : fn.call(ctx, ctx);
  if (invoker.isSuccess(ret)) {
    return ret;
  }

  fn = module.afterAction;
  if (fn) {
    ret = lang.isGeneratorFunction(fn) ? yield* fn.call(ctx, ctx) : fn.call(ctx, ctx);
    if (invoker.isSuccess(ret)) {
      return ret;
    }
  }

  return ret;
}
