'use strict';


const t = require('../../lib/core/render-helper').__test;   // eslint-disable-line
const PLACE_HOLDER = t.PLACE_HOLDER;
const mergeDepends = t.mergeDepends;


describe('core/render-helper', function() {
  const toResult = content => {
    return { content: content };
  };

  it('.mergeDepends', function() {
    const content = `
    ABC${PLACE_HOLDER}0000000000
    BCD${PLACE_HOLDER}0000000001
    ${PLACE_HOLDER}0000000003${PLACE_HOLDER}0000000002
    ${PLACE_HOLDER}00000000042${PLACE_HOLDER}0000000005988
    OTHER
    `;

    const rd = {};
    const depends = [
      'child a',
      'child b',
      'child c',
      'child d',
      'child e',
      'child f'
    ].map(toResult);

    const result = mergeDepends(rd, content, depends);
    const expect = `
    ABCchild a
    BCDchild b
    child dchild c
    child e2child f988
    OTHER
    `;
    result.should.be.equal(expect);
  });


  it('.mergeDepends no leading', function() {
    const content = `${PLACE_HOLDER}0000000000hi${PLACE_HOLDER}0000000001`;
    const rd = {};
    const depends = [
      'child a',
      'child b'
    ].map(toResult);

    const result = mergeDepends(rd, content, depends);
    const expect = 'child ahichild b';
    result.should.be.equal(expect);
  });
});
