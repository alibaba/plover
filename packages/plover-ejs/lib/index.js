'use strict';


const ejs = require('ejs');


exports.compile = function(source, settings) {
  const debug = settings.development;

  const opts = Object.assign({
    compileDebug: !!debug
  }, settings.ejs);

  const fn = ejs.compile(source, opts);

  return fn;
};
