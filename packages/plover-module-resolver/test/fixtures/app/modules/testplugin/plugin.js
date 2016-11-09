module.exports = function(app) {
  app.addMiddleware(function* (next) {
    if (this.url === '/testplugin') {
      this.body = 'hello testplugin';
    } else {
      yield next;
    }
  });
};
