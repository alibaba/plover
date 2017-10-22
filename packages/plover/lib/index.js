const assert = require('assert');
const EventEmitter = require('events');
const Koa = require('koa');
const ready = require('ready-callback');
const fmt = require('output-formatter');

const Resolver = require('plover-module-resolver');
const Logger = require('plover-logger');
const assign = require('plover-util/lib/assign');
const delegate = require('plover-util/lib/delegate');

const ConfigUtil = require('./util/config');


const logger = new Logger('plover:application');


/* eslint no-process-env: 0 */


class Application extends EventEmitter {
  /**
   * 创建应用对象
   *
   * 1. plover(settings)
   * 2. plover(app, settings)
   *
   * @param {KoaApplication} app - koa应用对象, 可选
   * @param {Object} settings    - 设置
   *
   * @since 1.0
   */
  constructor(app/*可选*/, settings) {
    super();

    if (!settings) {
      settings = app;
      app = null;
    }

    settings = assign({}, settings);

    prepareEnv(settings);

    // log should after prepare env
    logger.info('init application');
    logger.debug('settings: %o', settings);

    // this.server即koa application对象
    this.server = app || createServer(settings);
    this.context = this.server.context;

    prepareConfig(this, settings);

    ready().mixin(this);

    this.moduleResolver = createResolver(settings);
    this.server.moduleResolver = this.moduleResolver;
    this.context.moduleResolver = this.moduleResolver;

    // 初始化部件
    const components = this.$prepareComponents();
    initComponents(this, components);

    setImmediate(() => {
      printModules(this);

      try {
        this.moduleResolver.vertify();
      } catch (e) {
        this.emit('error', e);
      }
    });

    this.ready(() => {
      logger.info('application ready!');
    });
  }


  /**
   * 加载配置
   * 默认是从`应用/config`目录下找，可以通过配置`configRoot`指定配置目录
   *
   * @protected
   * @return {Object}  - 配置信息
   *
   * @since 1.0
   */
  $loadConfig() {
    let config = {};

    const settings = this.settings;
    const configRoot = settings.configRoot;
    if (configRoot) {
      logger.info('load config: %s', configRoot);
      config = ConfigUtil.load(configRoot);
    }

    assign(config, settings);

    return config;
  }


  /**
   * 准备部件
   *
   * @protected
   * @return {Array<Class>}  - components
   *
   * @since 1.0
   */
  $prepareComponents() {
    // 核心的组成部分
    const components = [
      'core',     // 中间件
      'service',  // 服务
      'router',   // 路由
      'navigate', // 渲染
      'plugin',   // 插件加载
      'startup'   // 从配置中加载各部件(Service, Filter, Helper等)
    ];

    return components.map(name => require('./components/' + name));
  }
}


exports = module.exports = function(app, settings) {
  return new Application(app, settings);
};


exports.Application = Application;


/*
 * 初始化日志级别和环境变量
 */
function prepareEnv(settings) {
  assert(
    settings.applicationRoot,
    '`settings.applicationRoot` required'
  );

  // 可以通过环境变量或配置指定日志级别
  // 1. 环境变量`LOG_LEVEL`优先
  // 2. 设置了`DEBUG`则默认将日志级别设置为'debug'
  // 3. 最后从配置中读取
  const logLevel = process.env.LOG_LEVEL ? process.env.LOG_LEVEL :
    process.env.DEBUG ? 'debug' :
      settings.logger ? settings.logger.level : false;

  if (logLevel) {
    Logger.level = logLevel.toLowerCase();
  }

  // 设置运行环境
  // 可以通过设置`DEBUG_PLOVER_ENV`环境变量设置运行环境
  settings.env = process.env.DEBUG_PLOVER_ENV || settings.env || 'development';

  // 是否开发态
  settings.development = settings.env === 'development';

  // 设置环境变量，方便配置文件对环境的感知
  process.env.PLOVER_ENV = settings.env;
}


/*
 * 初始化配置
 */
function prepareConfig(self, settings) {
  // plover app可以取得settings
  self.settings = settings;

  // 中间件上下文可以取得settings配置
  self.context.settings = settings;

  // 载入自定义的配置
  self.config = self.$loadConfig();

  // 中间件上下文可以取得config配置
  if (!self.context.config) {
    self.context.config = self.config;
  }
}


/*
 * 创建koa application对象
 */
function createServer(settings) {
  const server = new Koa();
  server.env = settings.env;
  return server;
}


function createResolver(settings) {
  const config = assign({
    applicationRoot: settings.applicationRoot,
    development: settings.development,
    modulesDir: settings.modulesDir,
    libModulesDir: settings.libModulesDir
  }, settings.moduleResolver);

  return new Resolver(config);
}


/*
 * 初始化Plover核心各部件
 * 各部件之间可以通过app对象协同
 */
function initComponents(self, components) {
  const app = Object.create(self);
  app.proto = self;
  for (const Component of components) {
    logger.info('init component: %s', Component.name);
    const com = new Component(app);  // eslint-disable-line
    delegate(self, com, com.exports || []);
  }
}


/*
 * 打印出模块列表
 */
function printModules(self) {
  const settings = self.settings;
  // 非开发环境不打印
  if (!settings.development) {
    return;
  }

  // 单元测试环境也不打印
  // `__testPrintModules`配置是用来专门测试这个方法的
  if (process.env.LOADED_MOCHA_OPTS && !settings.__testPrintModules) { // eslint-disable-line
    return;
  }

  const list = self.moduleResolver.list();

  let output = fmt.center('plover modules', 100) + '\n';
  output += fmt.line('-', 100) + '\n';
  output += fmt.center('name', 20) +
      fmt.center('plugin', 10) +
      fmt.center('assets', 10) +
      fmt.center('path', 60) + '\n';
  output += fmt.line('-', 100) + '\n';

  for (const info of list) {
    output += fmt.left(info.name, 20);
    output += fmt.center((info.plugin ? '√' : ' '), 10);
    output += fmt.center((info.assets && !info.assetsRoot ? '√' : ' '), 10);
    output += fmt.left(info.path) + '\n';
  }

  output = '\n\n' + output + '\n\n';
  global.console.log(output);
}

