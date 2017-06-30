const UrlBuilder = require('./url-builder');


module.exports = function(app) {
  const settings = app.settings;
  const config = settings.assets || (settings.assets = {});
  // 简单资源模式
  if (config.simple) {
    app.addHelper('assets', require('./simple-helper'));
    return;
  }

  require('./vendor')(app);
  app.addHelper('assets', require('./helper'));

  // 其他插件可以使用`assetsHandler`扩展资源处理器
  // 使用`ploverAssetsUrlBuilder`替换UrlBuilder
  app.ploverAssetsHandler = require('./handler');
  app.ploverAssetsUrlBuilder = new UrlBuilder(app);

  if (settings.development || config.enableMiddleware) {
    app.addMiddleware(require('./middleware'), 0);
  }
};

