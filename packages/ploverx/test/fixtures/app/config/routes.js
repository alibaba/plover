module.exports = (app) => {
  app.get('/hello', 'hello#show');
  app.use(require('../lib/try-logger')())
};
