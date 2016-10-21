'use strict';


module.exports = function(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
};
