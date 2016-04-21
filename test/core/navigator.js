'use strict';


const pathUtil = require('path');
const request = require('supertest');

const plover = require('../../');
const util = require('../util');


describe('core/navigator', function() {
  const root = pathUtil.join(__dirname, '../fixtures/core/navigator');
  const app = plover({ applicationRoot: root });
  app.addEngine('art', require('plover-arttemplate'));

  const agent = request.agent(app.callback());

  it('正常渲染一个页面', function() {
    return agent.get('/index')
        .expect(equal('index.html'))
        .expect(200);
  });


  it('返回json结果', function() {
  });
});


function equal(path) {
  path = pathUtil.join('core/navigator/expects/' + path);
  return util.htmlEqual(util.fixture(path));
}
