const assert = require('assert');
const pathUtil = require('path');
const antsort = require('antsort');


const logger = require('plover-logger')('plover:components/plugin');


class Plugin {
  /**
   * 加载插件
   *
   * 插件是一个plover模块
   * plover模块是一个`package.json`中配置plover域的node模块
   * 插件要求plover域中配置属性`plugin: path`
   *
   * @param {PloverApplication} app - Plover应用对象
   */
  constructor(app) {
    let plugins = getEnablePlugins(app);
    plugins = antsort(plugins, { defaultLevel: 3 });
    logger.info('install plugins:\n%o', plugins.map(info => info.name));

    for (const info of plugins) {
      logger.info('startup plugin: %s', info.name);
      const path = pathUtil.join(info.path, info.plugin);
      const fn = require(path);
      assert(typeof fn === 'function',
        'plugin module should be a function: ' + path);
      fn(app.proto);
    }
  }
}


module.exports = Plugin;


function getEnablePlugins(app) {
  const config = app.settings.plugins || {};

  const modules = app.moduleResolver.list();
  const plugins = modules.filter(info => {
    if (!info.plugin) {
      return false;
    }

    /*
     * 可以通过配置关闭插件
     *
     * ```
     * {
     *  plugins: {
     *    [name]: false
     *    [name]: {
     *      enable: false
     *    }
     *    [name]: {
     *      disable: true
     *    }
     *  }
     * }
     * ```
     */
    const name = info.name;
    const pconfig = config[name];
    if (pconfig === false ||
        (pconfig && pconfig.enable === false) ||
        (pconfig && pconfig.disable)) {
      return false;
    }

    return true;
  });

  return plugins;
}

