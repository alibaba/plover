'use strict';


const arrayUtil = require('..').Array;


describe('plover-util/lib/array', function() {
  it('#pushAll', function() {
    const a = [1, 2, 3];
    const b = ['a', 'b', 'c'];
    arrayUtil.pushAll(a, b);
    a.should.eql([1, 2, 3, 'a', 'b', 'c']);

    arrayUtil.pushAll([1, 2, 3], null).should.eql([1, 2, 3]);
  });
});
