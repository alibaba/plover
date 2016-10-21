'use strict';


const fs = require('fs');
const pathUtil = require('path');
const request = require('supertest');
const plover = require('plover');
const plugin = require('../lib/plugin');


describe('plugin', function() {
  it('use ejs', function() {
    const root = pathUtil.join(__dirname, 'fixtures/app');
    const app = plover({
      applicationRoot: root
    });

    plugin(app);

    return request(app.callback())
      .get('/index')
      .expect(htmlEqual(fixture('index.html')));
  });
});


function fixture(name) {
  const path = pathUtil.join(__dirname, 'fixtures/expect', name);
  return fs.readFileSync(path, 'utf-8');
}


function htmlEqual(expect) {
  return function(res) {
    trim(expect).should.equal(trim(res.text));
  };
}


function trim(html) {
  return html.replace(/\s+/g, '');
}
