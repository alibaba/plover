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
      cms: './lib/helpers/cms',
      assets: './lib/helpers/assets'
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


  it('with assets', function() {
    return request(app.callback())
      .get('/assets')
      .expect(equal('assets.html'));
  });


  it('navigate with transform assets', function() {
    return request(app.callback())
      .get('/assets/navigate')
      .expect(equal('assets-navigate.html'));
  });


  it('disable assets', function() {
    const myapp = plover({
      applicationRoot: root,
      helpers: {
        assets: './lib/helpers/assets'
      },
      assets: {
        disableAutowire: true
      }
    });
    return request(myapp.callback())
      .get('/assets')
      .expect(equal('assets-disable-autowaire.html'));
  });
});


function equal(path) {
  path = 'core/app/expects/' + path;
  return util.htmlEqual(util.fixture(path));
}
