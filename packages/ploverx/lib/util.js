/* eslint no-process-env: 0 */

const pathUtil = require('path');
const fs = require('fs');


exports.loadSettings = function(root) {
  const configRoot = pathUtil.join(root, 'config');

  const settings = {
    applicationRoot: root,
    env: process.env.NODE_ENV || 'development',
    disableDefaultRouter: true,
    defaultLayout: 'layouts:index'
  };

  const appConfig = require(pathUtil.join(configRoot, 'app.js'));
  Object.assign(settings, appConfig);

  prepareLibModulesDir(settings);

  const routesPath = pathUtil.join(configRoot, 'routes.js');
  if (fs.existsSync(routesPath)) {
    settings.routes = require(routesPath);
  }

  return settings;
};


function prepareLibModulesDir(settings) {
  const libs = [pathUtil.join(__dirname, '../')];

  let appLibs = settings.libModulesDir || settings.applicationRoot;
  if (!Array.isArray(appLibs)) {
    appLibs = [appLibs];
  }

  settings.libModulesDir = libs.concat(appLibs);
}
