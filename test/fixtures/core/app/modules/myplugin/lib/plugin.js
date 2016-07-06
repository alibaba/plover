'use strict';


module.exports = function(app) {
  require('plover-arttemplate/lib/plugin')(app);
  require('plover-ejs/lib/plugin')(app);
};
