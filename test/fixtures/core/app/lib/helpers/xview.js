'use strict';


exports.$proto = {
  emptyClass: function(v) {
    return v ? '' : 'empty';
  }
};


exports.formatPrice = function(price) {
  return price + '元';
};
