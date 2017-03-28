const fs = require('fs');
const pathUtil = require('path');
const resolveFrom = require('resolve-from');

const debug = require('debug')('plover-assets:vendor');

const rNamespace = /^@[-\w]+\//;


module.exports = function(app) {
  const settings = app.settings;
  const config = settings.assets || {};
  const vendors = config.vendors;
  if (!vendors) {
    return;
  }

  debug('try load module for assets vendor: %s', vendors);
  for (const item of vendors) {
    loadVendor(app, settings, item);
  }
};


function loadVendor(app, settings, item) {
  item = typeof item === 'string' ? { name: item } : item;
  const path = resolveFrom(settings.applicationRoot,
      item.name + '/package.json');
  const root = pathUtil.dirname(path);
  const pkg = require(path);

  const tryPath = pathUtil.join(root, 'dist');
  const dist = item.dist ? pathUtil.join(root, item.dist) :
      isDir(tryPath) ? tryPath : root;

  const info = {
    name: pkg.name.replace(rNamespace, ''),   // remove namespace
    version: pkg.version,
    path: dist,
    assets: true,
    assetsRoot: '',
    reload: false,
    build: false
  };

  debug('try load assets vendor: %o', info);
  app.moduleResolver.pushModule(info);
}


function isDir(path) {
  return fs.existsSync(path) && fs.statSync(path).isDirectory();
}

