'use strict';


const pathUtil = require('path');
const request = require('supertest');

const util = require('../util');
const plover = require('../../');


describe('core/view-render', function() {
  const root = pathUtil.join(__dirname, '../fixtures/core/app');
  const app = plover({ applicationRoot: root });
  const agent = request.agent(app.callback());

  it('render children', function() {
    return agent.get('/child')
      .expect(equal('child.html'));
  });


  it('view not found', function() {
    return agent.get('/child/view-not-found')
      .expect(/Not Found/);
  });


  it('view render error', function() {
    return agent.get('/child/renderError')
      .expect(500);
  });


  it('render child error', function() {
    return agent.get('/child/renderChildError')
      .expect(200);
  });


  describe('env production', function() {
    const myapp = plover({ applicationRoot: root, env: 'production' });
    const pagent = request.agent(myapp.callback());

    it('quick render', function() {
      return pagent.get('/child')
        .expect(equal('child-production.html'));
    });

    it('render child error', function() {
      return pagent.get('/child/renderChildError')
        .expect(200);
    });
  });
});


function equal(path) {
  path = 'core/app/expects/' + path;
  return util.htmlEqual(util.fixture(path));
}
