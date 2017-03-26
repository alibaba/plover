'use strict';


exports.$init = function() {
  this.emptyClass = function(v) {
    return v ? '' : 'empty';
  };
};


exports.formatPrice = function(price) {
  return price + '元';
};
