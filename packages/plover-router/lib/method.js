'use strict';


/* eslint no-underscore-dangle: 0 */

module.exports = function() {
  return function* PloverMethod(next) {
    const method = this.request.body._method;
    if (method && this.method === 'POST') {
      this.method = method.toUpperCase();
    }
    yield* next;
  };
};
