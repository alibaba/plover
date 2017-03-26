module.exports = function(app) {
  app.addMiddleware(function* (next) {
    if (this.url === '/test') {
      this.body = 'hello test';
    } else {
      yield* next;
    }
  });
};
