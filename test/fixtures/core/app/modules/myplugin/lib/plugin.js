'use strict';

module.exports = function(app) {
  app.addEngine('art', require('plover-arttemplate'));
  app.addEngine('ejs', require('plover-ejs'));
};
