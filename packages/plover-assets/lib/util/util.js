const pathUtil = require('path');
const fs = require('mz/fs');
const crypto = require('crypto');


exports.getTempDir = function(settings) {
  return pathUtil.join(settings.applicationRoot, 'tmp');
};


exports.getPublicDir = function(settings) {
  return (settings.assets || {}).publicRoot ||
      pathUtil.join(settings.applicationRoot, 'public');
};


exports.getAssetsPrefix = function(settings) {
  return (settings.assets || {}).prefix || '/g';
};


exports.loadBuildConfig = function* (info) {
  const path = pathUtil.join(info.path, 'build.js');
  const config = (yield fs.exists(path)) ? require(path) : {};
  const obj = info.build ? info.build :
      info.build === false ? { enable: false } : null;
  return Object.assign({}, config, obj);
};


const rQueryStamp = /\?.*$/;

/**
 * 取得缓存地址
 *
 * @param   {String}  path     - 原始地址
 * @param   {Object}  settings - 配置
 * @return  {String}           - 缓存地址
 */
exports.getCachePath = function(path, settings) {
  const tmpdir = exports.getTempDir(settings);
  const shasum = crypto.createHash('sha1');
  shasum.update(path);
  const filename = shasum.digest('hex') +
      pathUtil.extname(path).replace(rQueryStamp, '');
  return pathUtil.join(tmpdir, filename);
};


exports.loadManifest = function(settings) {
  const publicDir = exports.getPublicDir(settings);
  const prefix = exports.getAssetsPrefix(settings);
  const path = pathUtil.join(publicDir, prefix, 'manifest.json');
  if (!fs.existsSync(path)) {
    return null;
  }

  const map = new Map();
  const obj = JSON.parse(fs.readFileSync(path, 'utf-8'));
  for (const key in obj) {
    map.set(key, obj[key]);
  }
  return map;
}
