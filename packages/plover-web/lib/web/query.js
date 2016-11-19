'use strict';


const querystring = require('querystring');
const qs = require('qs');

const QUERY = Symbol('query');


module.exports = function(app) {
  Object.defineProperty(app.context, 'query', {
    get: function() {
      let parsed = this[QUERY];
      if (!parsed) {
        parsed = parse(this.querystring);
        this[QUERY] = parsed;
      }
      return parsed;
    }
  });
};


const rSimple = /^[-\w]+$/;

function parse(str) {
  const obj = querystring.parse(str);
  const keys = Object.keys(obj);
  const isSimple = keys.every(key => rSimple.test(key));
  if (isSimple) {
    return filter(obj, keys);
  }

  const results = qs.parse(str, { allowDots: true });
  return filter(results, keys);
}


function filter(obj, keys) {
  keys.forEach(key => {
    const val = obj[key];
    if (val && Array.isArray(val) && rSimple.test(key)) {
      obj[key] = val[val.length - 1];   // use array's last item
    }
  });
  return obj;
}
