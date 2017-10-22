

module.exports = function(o, target, methods) {
  for (const name of methods) {
    const fn = target[name];
    if (!fn) {
      throw new Error(`target method undefined: ${name}`);
    }
    o[name] = fn.bind(target);
  }
  return o;
};
