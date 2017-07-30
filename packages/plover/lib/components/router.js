const assign = require('plover-util/lib/assign');

const Router = require('../util/router');
const RouteCache = require('../util/route-cache');


const logger = require('plover-logger')('plover:components/router');


class RouterComponent {
  /**
   * 路由
   *
   * 1. 将url处理成路由模型
   * 2. 暴露`addRoute`方法用于添加路由
   *
   * @param {PloverApplication} app  - Plover应用对象
   */
  constructor(app) {
    this.app = app;
    this.router = new Router();

    app.addMiddleware(createRouteComponent(this), 2);

    this.exports = ['addRoute'];
  }


  /**
   * 添加路由规则
   *
   * @param {String|RegExp} pattern - 匹配规则
   * @param {String}        to      - 定位规则
   * @param {Objectd}       options - 额外的选项
   *
   * @see util/router.js
   */
  addRoute(pattern, to, options) {
    this.router.add(pattern, to, options);
  }
}


module.exports = RouterComponent;


function createRouteComponent(self) {
  const router = self.router;
  const settings = self.app.settings;

  // 可以通过settings.disableDefaultRouter关闭默认路由规则
  const defaultRouter = settings.disableDefaultRouter ?
          null : createDefaultRouter();

  const routeCache = new RouteCache(self.app);

  return async function RouterComponentx(ctx, next) {
    // 如果有其他中间件能搞定这事就不管了
    if (ctx.route) {
      logger.debug('already routed: %o', ctx.route);
      return next();
    }

    const path = ctx.path;
    const method = ctx.method;
    const cacheKey = `${method} ${path}`;
    logger.debug('try route: %s', path);

    // 尝试从cache中获取，取不到再进行路由
    let route = routeCache.get(cacheKey);
    if (!route) {
      // 先走应用的自定义路由
      // 如果有默认路由，再走默认路由
      route = router.route(path, { method }) ||
          defaultRouter && defaultRouter.route(path, { method });
      if (route) {
        routeCache.set(cacheKey, route);
      }
    }

    if (route) {
      assign(route.query, ctx.query);
      logger.debug('route success: %o', route);
      ctx.route = route;
    } else {
      ctx.route = null;
    }

    return next();
  };
}


/*
 * 创建默认路由规则
 *
 * 默认支持以下url访问页面：
 * /                      访问 index:view
 * /module/action         访问 module:action
 * /module/action.html    同上
 * /module/getData.json   访问 module:getDta，期望以数据(json|jsonp)方式得到结果
 * /module                访问 index:view
 *
 * 默认路由规则的action名首字母必须为[a-zA-Z]，这样的设定是为了方便内部action的编写
 * 比如可以以 _ 开头的action不能通过url访问，却可以在模块中引用，可以方便地控制访问级别
 */
function createDefaultRouter() {
  const router = new Router();
  /* eslint-disable */
  router.add(/^\/([a-zA-Z][-\w]*?)(?:\/([a-zA-Z][-\w]*?))?(?:\.(?:html|htm|json|jsonp))?\/?$/,
      { module: '$1', action: '$2' });
  router.add(/^\/$/, { module: 'index', action: 'view' });
  /* eslint-enable */
  return router;
}

