const session = require('koa-session');


module.exports = function(opts, app) {
  opts = Object.assign({}, opts);
  opts.store = createStore(opts.store, opts.storeOpts);
  return session(opts, app);
};


function createStore(store, opts) {
  if (store === 'redis') {
    return require('koa-redis')(opts);
  }
  return null;
}
