'use strict';


const PARAMS = Symbol('params');


module.exports = function(app) {
  Object.defineProperty(app.context, 'params', {
    get: function() {
      let params = this[PARAMS];
      if (!params) {
        params = Object.assign({}, this.query, this.request.body);
        this[PARAMS] = params;
      }
      return params;
    }
  });
};
