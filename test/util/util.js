'use strict';


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
      }
    };

    gutil.delegateGetters(services, ['dsService', 'offerService']);
    services.dsService.name.should.be.equal('dsService');
  });


  it('util.loadModule', function() {
    const root = pathUtil.join(__dirname, '../fixtures/util/util');
    gutil.loadModule(root, './lib/a').should.be.equal('a');
    gutil.loadModule(root, 'a').should.be.equal('a');
  });
});

