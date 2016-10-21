'use strict';


const sleep = require('../../lib/sleep');


exports.view = function* () {
  yield sleep(20);
  const done = this.benchmark.mark('get view data');
  yield sleep(8);
  done();

  this.render();
};


exports.item = function* () {
  yield sleep(10);
  this.benchmark.mark('unknow request');
  this.render();
};
