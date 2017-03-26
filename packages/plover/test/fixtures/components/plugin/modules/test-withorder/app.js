module.exports = function(app) {
  app.addMiddleware(function* (next) {
    if (this.url === '/test-withorder') {
      this.body = 'hello test-withorder';
    } else {
      yield* next;
    }
  });
};
