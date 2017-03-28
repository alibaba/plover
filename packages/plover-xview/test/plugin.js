const pathUtil = require('path');
const mm = require('plover-test-mate');
const plugin = require('../lib/plugin');


describe('plugin', () => {
  const applicationRoot = pathUtil.join(__dirname, 'fixtures/app');
  const expectRoot = pathUtil.join(__dirname, 'fixtures/expect');

  describe('xview', () => {
    const app = mm({
      applicationRoot,
      expectRoot,
      xview: {
        viewdata: {
          site: 'xview'
        }
      }
    });

    app.install('plover-arttemplate');
    app.install(plugin);

    app.use((ctx, next) => {
      ctx.csrf = 'csrf-token-123';
      ctx.ctoken = 'ctoken-456';
      return next();
    });
    app.it('/', 'index.html');
  });


  describe('coverage', () => {
    const app = mm({
      applicationRoot,
      expectRoot
    });

    app.install('plover-arttemplate');
    app.install(plugin);

    app.use((ctx, next) => {
      return next();
    });
    app.it('/index/coverage', 'coverage.html');
  });
});
