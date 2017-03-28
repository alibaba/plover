'use strict';


exports.isGenerator = function(obj) {
  return obj &&
    typeof obj.next === 'function' &&
    typeof obj.throw === 'function';
};


exports.isGeneratorFunction = function(obj) {
  return obj && obj.constructor &&
    obj.constructor.name === 'GeneratorFunction';
};


exports.isPromise = function(obj) {
  return obj && typeof obj.then === 'function';
};


exports.isAsyncFunction = function(obj) {
  return obj && obj.constructor &&
    obj.constructor.name === 'AsyncFunction';
};


exports.isPureFunction = function(obj) {
  return obj && obj.constructor &&
    obj.constructor.name === 'Function';
};
