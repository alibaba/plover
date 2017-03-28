exports.view = function() {
  this.layout = this.query.layoutejs ? 'layoutejs' : 'layout';
  this.render();
};


exports.child = function() {
  this.render();
};


exports.layout = function() {
  this.render();
};


exports.layoutejs = exports.layout;


exports.navigate = function* () {
  this.layout = false;
  const result = yield this.navigate('view');
  const data = {
    content: result.content,
    myassets: result.assets.default
  };
  this.render(data);
};
