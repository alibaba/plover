'use strict';


exports.view = function() {
  this.render();
};


exports.mobile = function() {
  this.render();
};


exports.simple = function() {
  this.body = 'simple layout\n' + this.data.content;
};


exports.invalid = function() {
  // no render, page will 404
};
