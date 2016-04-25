'use strict';


exports.view = function() {
  const layout = this.query.layout;
  if (layout) {
    this.layout = layout === 'false' ? false : layout;
  }

  this.render({
    name: 'plover',
    version: '1.0.0',
    desc: 'nodejs webframework'
  });
};


exports.navigate = function* () {
  if (this.query.yield === 'true') {
    return yield this.navigate('view');
  }
  return this.navigate('view');
};


exports.banner = function() {
  this.render();
};


exports.returnFalse = function() {
  return false;
};


exports.setBody = function() {
  this.body = 'hello world';
};


exports.layoutNotFound = function() {
  this.layout = 'notfound';
  this.render();
};
