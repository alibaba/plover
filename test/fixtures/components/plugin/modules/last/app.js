module.exports = function(app) {
  app.addMiddleware(function* () {
    this.body = 'last';
  });
};

