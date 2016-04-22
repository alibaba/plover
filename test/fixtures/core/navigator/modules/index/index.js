'use strict';


exports.view = function() {
  if (this.query.layout === 'false') {
    this.layout = false;
  }

  this.render({
    name: 'plover',
    version: '1.0.0',
    desc: 'nodejs webframework'
  });
};


exports.banner = function() {
  this.render();
};
