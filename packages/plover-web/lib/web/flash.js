'use strict';


const KEY = 'plover-flash';
const FLASH = Symbol(KEY);


module.exports = function(app) {
  Object.defineProperty(app.context, 'flash', {
    get: function() {
      return this[FLASH];
    }
  });


  return function* PloverFlash(next) {
    this[FLASH] = this.session[KEY] || {};
    delete this.session[KEY];

    yield* next;

    if (this.status === 302) {
      this.session[KEY] = this[FLASH];
    }
  };
};
