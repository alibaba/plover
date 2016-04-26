'use strict';


exports.view = function() {
  this.layout = 'layout';
  this.render();
};


exports.layout = function() {
  this.render();
};
