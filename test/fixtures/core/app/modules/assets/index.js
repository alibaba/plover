'use strict';


exports.view = function() {
  this.layout = 'layout';
  this.render();
};


exports.layout = function() {
  this.render();
};


exports.navigate = function* () {
  this.layout = false;
  const result = yield this.navigate('view');
  const data = {
    content: result.content,
    myassets: result.assets.default
  };
  this.render(data);
};
