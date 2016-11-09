'use strict';


const lang = require('..').Lang;


describe('plover-util/lib/lang', function() {
  it('#isGenerator', function() {
    const fn = function* () {
      yield 1;
    };

    lang.isGenerator(fn()).should.be.true();
    lang.isGenerator({}).should.be.false();
  });


  it('#isGeneratorFunction', function() {
    const fn = function* () {
      yield 2;
    };

    lang.isGeneratorFunction(fn).should.be.true();
    lang.isGeneratorFunction(function() {}).should.be.false();
  });


  it('#isPromise', function() {
    lang.isPromise(new Promise(function() {})).should.be.true();
    lang.isPromise({ then: function() {} }).should.be.true();
    lang.isPromise(function() {}).should.be.false();
  });
});
