'use strict';


const util = require('../util/util');


const logger = require('plover-logger')('plover:components/service');


class Service {

  constructor(app) {
    this.app = app;
    this.services = {};

    app.addMiddleware(createServiceComponent(this), 0);

    this.exports = ['addService'];
  }


  /**
   * 添加服务对象
   *
   * @param {String}  name    - 服务名称，应用范围内不允许重复
   * @param {String}  service - 服务对象
   *  服务可以是一个类或对象
   *  如果有`startup`方法时则会自动调用它完成初始化
   *  如果是一个`类`，则每次request且使用到此Service时，都会构造一个实例对象放到中间件上下文中
   *  如果是一个普通对象，则每次request时，直接放到中间件上下文中
   *
   * @see createServiceObject
   */
  addService(name, service) {
    if (this.services[name]) {
      throw new Error('service name conflict: ' + name);
    }
    this.services[name] = service;
  }
}


module.exports = Service;


/**
 * 服务容器，延迟初始化服务
 * @param {KoaApplication}  ctx  koa应用对象
 */
class ServiceContainer {
  constructor(ctx) {
    this.$ctx = ctx;
    this.$cache = new Map();
  }


  $get(name) {
    const cache = this.$cache;
    let service = null;
    if (cache.has(name)) {
      service = cache.get(name);
    } else {
      service = ServiceContainer.services[name];
      if (typeof service === 'function') {
        logger.debug('create service object: %s', name);
        const Class = service;
        service = new Class(this.$ctx);
      }
      cache.set(name, service);
    }
    return service;
  }
}


ServiceContainer.refine = function(services) {
  ServiceContainer.services = services;
  util.delegateGetters(this.prototype, Object.keys(services));
};


/*
 * 核心中间件
 *
 * 1. 加载和初始化服务
 * 2. 每次请求时，创建服务实例注入到中间件上下文
 */
function createServiceComponent(self) {
  // 返回一个function而不是直接返回GeneratorFunction是因为后面可能会有额外的服务添加
  // 比如配置文件中会添加额外的服务, 直接loadServices太早了。
  return function() {
    const app = self.app;
    const services = self.services;
    const proto = app.proto;

    // 通过PloverApplication对象可以取得services集合
    proto.services = services;

    // 初始化serivces
    startupServices(services, proto);

    // 注入Services到koa上下文
    attachServicesToServer(services, proto.server);

    ServiceContainer.refine(services, proto);

    return function* ServiceComponent(next) {
      this.services = new ServiceContainer(this);
      yield* next;
    };
  };
}


/*
 * 加载和初始化服务，应用启动时执行
 */
function startupServices(services, proto) {
  for (const name in services) {
    const service = services[name];
    if (typeof service.startup === 'function') {
      logger.info('startup service: %s', name);
      service.startup(proto);
    }
  }
}


/*
 * 注入服务属性到koa上下文
 */
function attachServicesToServer(services, server) {
  const context = server.context;
  util.delegateGetters(context, Object.keys(services), function(name) {
    return this.services.$get(name);
  });
}
