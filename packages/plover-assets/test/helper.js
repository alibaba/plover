const pathUtil = require('path');
const mm = require('plover-test-mate');

const plugin = require('../lib/plugin');


describe('helper', function() {
  const appRoot = pathUtil.join(__dirname, 'fixtures/app');
  const expectRoot = pathUtil.join(__dirname, 'fixtures/expect');

  it('use assets helper', function() {
    const app = mm({
      applicationRoot: appRoot,
      expectRoot: expectRoot,
      port: 60001,
      env: 'test'
    });

    app.install('plover-arttemplate');
    app.install(plugin);

    return app.test('/list', 'list.html');
  });

  it('assets tags with url concat', function() {
    const app = mm({
      applicationRoot: appRoot,
      expectRoot: expectRoot,
      env: 'production',
      port: 60002,
      assets: {
        enableConcat: true,
        concatItems: [
          { match: /^\/g\/(.*)$/, prefix: '/g/??' }
        ]
      }
    });

    app.install('plover-arttemplate');
    app.install(plugin);

    return app.test('/list', 'list-concat.html');
  });
});
