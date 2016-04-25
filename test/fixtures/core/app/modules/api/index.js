'use strict';


exports.offer = function() {
  this.type = 'json';
  this.render({ id: 123, name: 'test offer' });
};
