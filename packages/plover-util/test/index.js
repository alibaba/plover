'use strict';


const util = require('..');

describe('plover-util', function() {
  const fields = [
    'Array',
    'delegate',
    'Lang',
    'RouteInfo',
    'SafeString'
  ];

  fields.forEach(name => {
    it(`#${name}`, function() {
      util[name].should.not.undefined();
    });
  });
});
