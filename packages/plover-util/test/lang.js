'use strict';


const lang = require('..').Lang;


/* eslint no-empty-function: 0 */


describe('plover-util/lib/lang', function() {
  it('.isGenerator', function() {
    const fn = function* () {
      yield 1;
    };

    lang.isGenerator(fn()).should.be.true();
    lang.isGenerator({}).should.be.false();
  });


  it('.isGeneratorFunction', function() {
    const fn = function* () {
      yield 2;
    };

    lang.isGeneratorFunction(fn).should.be.true();
    lang.isGeneratorFunction(function() {}).should.be.false();
  });


  it('.isPromise', function() {
    lang.isPromise(new Promise(function() {})).should.be.true();
    lang.isPromise({ then: function() {} }).should.be.true();
    lang.isPromise(function() {}).should.be.false();
  });


  it('.isAsyncFunction', function() {
    lang.isAsyncFunction(async function() {}).should.be.true();
    lang.isAsyncFunction(async() => null).should.be.true();
    lang.isAsyncFunction(function() {}).should.be.false();
    lang.isAsyncFunction(1).should.be.false();
    (!!lang.isAsyncFunction(null)).should.be.false();
  });


  it('.isPureFunction', function() {
    lang.isPureFunction(function() {}).should.be.true();
    lang.isPureFunction(() => {}).should.be.true();
    lang.isPureFunction(function* () {}).should.be.false();
    lang.isPureFunction(async function() {}).should.be.false();
  });
});
