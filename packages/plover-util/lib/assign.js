'use strict';


module.exports = function() {
  const args = arguments;
  const des = args[0];
  for (let i = 1, c = args.length; i < c; i++) {
    const src = args[i];
    for (const k in src) {
      des[k] = src[k];
    }
  }
  return des;
};
