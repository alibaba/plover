const fs = require('fs-extra');
const pathUtil = require('path');
const crypto = require('crypto');
const scanDir = require('../util/scan-dir');


module.exports = function(settings, options) {
  const assets = settings.assets || {};
  if (!assets.digest) {
    return;
  }

  const root = options.outputDir;
  const list = scanDir(root);

  const manifest = {};
  for (const path of list) {
    const hash = digest(path);
    const ext = pathUtil.extname(path);
    const filename = pathUtil.basename(path, ext) + '-' + hash;
    const outpath = pathUtil.join(pathUtil.dirname(path), filename + ext);
    fs.copySync(path, outpath);

    const from = pathUtil.relative(root, path);
    const to = pathUtil.relative(root, outpath);
    manifest[from] = to;
  }

  writeManifest(root, manifest);
};


function digest(path) {
  const shasum = crypto.createHash('sha1');
  const buf = fs.readFileSync(path);
  shasum.update(buf);
  return shasum.digest('hex').substr(0, 10);
}


function writeManifest(root, manifest) {
  const path = pathUtil.join(root, 'manifest.json');
  fs.writeFileSync(path, JSON.stringify(manifest));
}
