'use strict';


const sleep = require('../../lib/sleep');


exports.view = function* () {
  yield sleep(80);
  this.render();
};
