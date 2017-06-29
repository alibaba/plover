const assetsUtil = require('./util/util');

const rSlash = /^\//;
const rSlashEnd = /\/$/;

module.exports = function(app) {
  const settings = app.settings || {};
  const config = settings.assets || {};

  const prefix = config.prefix || '/g';
  let urlPrefix = settings.development ? prefix :
      (config.urlPrefix || prefix);
  urlPrefix = urlPrefix.replace(rSlashEnd, '');

  const manifest = settings.development ?  null :
      assetsUtil.loadManifest(settings);

  const getUrl = function(url) {
    url = url.replace(rSlash, '');
    if (manifest) {
      url = manifest.get(url) || url;
    }
    return urlPrefix + '/' + url;
  };

  return { url: getUrl };
};
