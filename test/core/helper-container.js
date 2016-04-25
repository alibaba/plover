'use strict';


const pathUtil = require('path');
const request = require('supertest');

const plover = require('../../');

const util = require('../util');


describe('core/helper-container', function() {
  const root = pathUtil.join(__dirname, '../fixtures/core/app');

  it('添加helper', function() {
    const app = plover({
      applicationRoot: root,
      helpers: {
        urlHelper: './lib/helpers/url-helper',
        xview: './lib/helpers/xview'
      }
    });

    return request(app.callback())
      .get('/helper')
      .expect(equal('helper.html'));
  });
});


function equal(path) {
  path = 'core/app/expects/' + path;
  return util.htmlEqual(util.fixture(path));
}
