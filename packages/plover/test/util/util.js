const pathUtil = require('path');

const gutil = require('../../lib/util/util');


describe('util/util', function() {
  it('util.delegateGetters', function() {
    const Service = function(name) {
      this.name = name;
    };

    const services = {
      $get: function(name) {
        return new Service(name);
      },

      myName: 'hello'
    };

    gutil.delegateGetters(services, ['dsService', 'offerService', 'myName']);
    services.dsService.name.should.equal('dsService');
    services.myName.should.equal('hello');
  });


  it('util.loadModule', function() {
    const root = pathUtil.join(__dirname, '../fixtures/util/util');
    gutil.loadModule(root, './lib/a').should.equal('a');
    gutil.loadModule(root, 'a').should.equal('a');
    gutil.loadModule(root, pathUtil.join(root, 'lib/a')).should.equal('a');
  });
});

