'use strict';


const ID = Symbol('id');
const MARK = Symbol('mark');


exports.beforeAction = function() {
  let space = '';
  let p = this.route.parent;
  while (p) {
    space += ' ';
    p = p.parent;
  }

  this[ID] = space + this.route.url;
  this[MARK] = {};

  this[MARK].action = this.benchmark.mark(this[ID] + '.action');
};


exports.afterAction = function() {
  this[MARK].action();
};


exports.beforeRender = function() {
  this[MARK].render = this.benchmark.mark(this[ID] + '.render');
};


exports.afterRender = function() {
  this[MARK].render();
};
