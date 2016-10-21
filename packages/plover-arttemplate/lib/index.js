'use strict';


const arttemplate = require('art-template-for-plover');
const utils = require('./utils');


Object.assign(arttemplate.utils, utils);
arttemplate.onerror = function(e) {
  throw e;
};


class Engine {
  constructor(config) {
    config = config || {};

    this.development = config.development;
    this.async = config.async;
    this.compress = config.compress;
  }


  compile(source, options) {
    options = options || {};

    const opts = {
      filename: options.path,
      inspect: this.async,
      compress: this.compress,
      debug: this.development
    };

    const render = arttemplate.compile(source, opts);
    return function(context) {
      return render(context, options.path);
    };
  }
}


module.exports = Engine;

