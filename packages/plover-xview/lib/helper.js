const escape = require('escape-html');
const fmt = require('output-formatter');
const SafeString = require('plover-util/lib/safe-string');
const assign = require('plover-util/lib/assign');


const RD = Symbol('rd');
const VIEW_DATA = Symbol('viewdata');


/*
 * 此方法在由框架自动调用，用于注入一些帮助方法
 *
 * 视图中可以使用以下数据和方法
 *
 * - csrf
 * - ctoken
 *
 * - $.viewdata(name, value)
 * - $.viewdata(map)
 */

class Helper {
  static $init(rd) {
    rd.data.csrf = rd.ctx.csrf;
    rd.data.ctoken = rd.ctx.ctoken;
  }


  constructor(rd) {
    this[RD] = rd;
  }


  viewdata(...args) {
    const layoutData = this[RD].layout.data;
    const cache = layoutData[VIEW_DATA] || (layoutData[VIEW_DATA] = {});
    const type = typeof args[0];
    if (type === 'string') {
      cache[args[0]] = args[1];
    } else if (type === 'object' && args[0]) {
      assign(cache, args[0]);
    } else {
      console.warn(fmt.yellow('invalid viewdata: '), args[0]); // eslint-disable-line
    }
    return '';
  }


  metaTags(opts) {
    opts = opts || {};
    const rd = this[RD];
    const ctx = rd.ctx;
    const settings = ctx.settings;
    const config = settings.xview || {};

    let tags = `<meta name="x-env" content="${settings.env}" />`;
    if (ctx.csrf) {
      tags += `\n<meta name="x-csrf" content="${ctx.csrf}" />`;
    }
    if (ctx.ctoken) {
      tags += `\n<meta name="x-ctoken" content="${ctx.ctoken}" />`;
    }

    if (opts.viewdata) {
      const data = {};
      config.viewdata && assign(data, config.viewdata);
      assign(data, rd.layout.data[VIEW_DATA]);
      tags += `\n<meta name="x-viewdata" content="${escape(JSON.stringify(data))}" />`;  // eslint-disable-line
    }

    return new SafeString(tags);
  }
}


module.exports = Helper;
