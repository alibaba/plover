const UrlBuilder = require('./url-builder');


module.exports = function(app) {
  require('./vendor')(app);

  app.addHelper('assets', require('./helper'));

  // 其他插件可以使用`assetsHandler`扩展资源处理器
  // 使用`ploverAssetsUrlBuilder`替换UrlBuilder
  app.ploverAssetsHandler = require('./handler');
  app.ploverAssetsUrlBuilder = new UrlBuilder(app);

  const settings = app.settings;
  const config = settings.assets || (settings.assets = {});

  if (settings.development || config.enableMiddleware) {
    app.addMiddleware(require('./middleware'), 0);
  }
};

