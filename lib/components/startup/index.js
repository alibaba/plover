'use strict';


const util = require('../../util/util');


const logger = require('plover-logger')('plover:components/startup');


class Startup {

  /**
   * 根据配置信息初始化应用
   * 主要添加以下plover部件：
   *  服务，中间件，渲染引擎，渲染帮助方法和渲染拦截器
   *
   * @param {PloverApplication} app - plover应用对象
   */
  constructor(app) {
    const settings = app.settings;
    const root = settings.applicationRoot;

    // 服务
    settings.services && addServices(app, root, settings.services);

    // 中间件
    require('./middleware')(app);

    // 路由信息，可以在settings配置也可以独立文件配置
    const routes = settings.routes;
    routes && addRoutes(app, routes);

    // 渲染帮助方法
    settings.helpers && addHelpers(app, root, settings.helpers);

    // 渲染拦截器
    settings.filters && addFilters(app, root, settings.filters);
  }
}


module.exports = Startup;


/*
 * 添加服务
 */
function addServices(app, root, services) {
  logger.info('add services: %o', services);
  for (const name in services) {
    const service = util.loadModule(root, services[name]);
    app.addService(name, service);
  }
}


/*
 * 添加路由
 */
function addRoutes(app, routes) {
  logger.info('add routes: %o', routes);
  for (const pattern in routes) {
    app.addRoute(pattern, routes[pattern]);
  }
}


/*
 * 添加渲染帮助方法
 */
function addHelpers(app, root, helpers) {
  logger.info('add helpers: %o', helpers);
  for (const name in helpers) {
    const helper = util.loadModule(root, helpers[name]);
    app.addHelper(name, helper);
  }
}


function addFilters(app, root, filters) {
  logger.info('add filters: %o', filters);
  for (const path of filters) {
    const filter = util.loadModule(root, path);
    // 设置$name属性是为了方便日志记录
    filter.$name = path;
    app.addFilter(filter);
  }
}

