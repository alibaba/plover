const pathUtil = require('path');
const mm = require('plover-test-mate');

const plugin = require('../lib/plugin');


describe('simple-helper', function() {
  const appRoot = pathUtil.join(__dirname, 'fixtures/simple');
  const expectRoot = pathUtil.join(__dirname, 'fixtures/expect');

  it('use simple helper', function() {
    const app = mm({
      applicationRoot: appRoot,
      expectRoot: expectRoot,
      port: 60005,
      env: 'test'
    });

    app.install('plover-ejs');
    app.install(plugin);

    return app.test('/page', 'simple.html');
  });
});

