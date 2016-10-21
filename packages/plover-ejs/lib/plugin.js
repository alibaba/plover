'use strict';


module.exports = function(app) {
  app.addEngine('ejs', require('./index'));
};

