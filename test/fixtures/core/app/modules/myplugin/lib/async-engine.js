'use strict';


exports.async = true;

exports.compile = function(source) {
  return function() {
    return Promise.resolve(source);
  };
};
