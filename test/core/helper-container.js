'use strict';


const pathUtil = require('path');
const request = require('supertest');

const plover = require('../../');

const util = require('../util');


describe('core/helper-container', function() {
  const root = pathUtil.join(__dirname, '../fixtures/core/app');
  const app = plover({
    applicationRoot: root,
    helpers: {
      urlHelper: './lib/helpers/url-helper',
      xview: './lib/helpers/xview',
      cms: './lib/helpers/cms'
    }
  });

  it('use helper', function() {
    return request(app.callback())
      .get('/helper')
      .expect(equal('helper.html'));
  });


  it('async render', function() {
    return request(app.callback())
      .get('/helper/async')
      .expect(equal('helper-async.html'));
  });
});


function equal(path) {
  path = 'core/app/expects/' + path;
  return util.htmlEqual(util.fixture(path));
}
