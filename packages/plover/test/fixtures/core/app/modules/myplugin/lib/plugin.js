module.exports = function(app) {
  require('plover-arttemplate/lib/plugin')(app);
  require('plover-ejs/lib/plugin')(app);
  app.addEngine('my', require('./async-engine'));
};

