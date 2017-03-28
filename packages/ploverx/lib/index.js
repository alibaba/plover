const plover = require('plover');
const util = require('./util');
const installLogger = require('./install-logger');


/* eslint no-process-env: 0, no-console: 0 */


module.exports = function(options) {
  options = options || {};
  const settings = util.loadSettings(options.applicationRoot);
  installLogger(settings);

  const app = plover(settings);

  app.run = () => {
    const port = (settings.server || {}).port || 4000;
    app.listen(port);
    console.log(`server started: 127.0.0.1:${port}, env: ${settings.env}`);
  };

  return app;
};
