module.exports = function(app) {
  app.addHelper('$', require('./helper'));
};

