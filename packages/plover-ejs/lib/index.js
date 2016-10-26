'use strict';


const ejs = require('ejs');


exports.compile = function(source, settings) {
  const debug = settings.development;

  const opts = Object.assign({
    compileDebug: !!debug,
    rmWhitespace: !debug
  }, settings.ejs);

  return ejs.compile(source, opts);
};
