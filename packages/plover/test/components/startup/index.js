const pathUtil = require('path');
const sinon = require('sinon');


const StartupComponent = require('../../../lib/components/startup');


describe('components/startup', function() {
  it('plover会根据配置加载各种部件(middleware, service等)', function() {
    const settings = getSettings();

    const app = createMockApp(settings);
    new StartupComponent(app);    // eslint-disable-line

    app.addRoute.called.should.be.true();
    app.use.callCount.should.equal(1);
    app.addService.called.should.be.true();
    app.addFilter.called.should.be.true();
    app.addHelper.called.should.be.true();
  });
});


function getSettings() {
  const root = pathUtil.join(__dirname, '../../fixtures/components/startup');

  const settings = {
    applicationRoot: root,

    routes: {
      '/offer/:offerId': 'offer/view'
    },

    middlewares: [
      './lib/middlewares/hello.js'
    ],

    services: {
      productService: './lib/services/product.js'
    },

    filters: [
      './lib/filters/box.js',
      {
        module: './lib/filters/api.js',
        match: '/api'
      }
    ],

    helpers: {
      priceHelper: './lib/helpers/price.js'
    }
  };

  return settings;
}


function createMockApp(settings) {
  const app = {
    settings: settings,
    config: {},

    addRoute: sinon.spy(),
    use: sinon.spy(),
    addService: sinon.spy(),
    addFilter: sinon.spy(),
    addHelper: sinon.spy()
  };

  return app;
}

