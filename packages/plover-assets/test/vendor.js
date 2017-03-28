const pathUtil = require('path');
const plover = require('plover');
const plugin = require('../lib/plugin');


describe('vendor', function() {
  const root = pathUtil.join(__dirname, 'fixtures/vendor');

  it('should load assets modules', function() {
    const app = plover({
      applicationRoot: root,
      assets: {
        vendors: [
          'jquery',
          'bootstrap',
          { name: 'vue', dist: 'output' }
        ]
      }
    });
    plugin(app);

    const resolver = app.moduleResolver;
    resolver.resolve('jquery')
      .should.eql({
        name: 'jquery',
        version: '2.0.0',
        path: pathUtil.join(root, 'node_modules/jquery'),
        assets: true,
        assetsRoot: '',
        reload: false,
        build: false
      });

    resolver.resolve('bootstrap').path
      .should.equal(pathUtil.join(root, 'node_modules/bootstrap/dist'));

    resolver.resolve('vue').path
      .should.equal(pathUtil.join(root, 'node_modules/vue/output'));
  });


  it('coverage for no assets config', function() {
    const app = plover({ applicationRoot: root });
    plugin(app);
  });
});
