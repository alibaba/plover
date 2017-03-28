exports.view = function() {
  this.layout = false;
  this.render();
};


exports.beforeRender = function* () {
  if (this.query.break === 'true') {
    this.body = this.query.body ? 'break in beforeRender' : null;
    return false;
  }
};

exports.afterRender = function() {
  if (this.query.filterAfter === 'true') {
    this.body = 'after:' + this.body;
  }
};
