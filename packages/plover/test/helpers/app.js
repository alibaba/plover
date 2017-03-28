const pathUtil = require('path');
const request = require('supertest');

const plover = require('../../');
const equal = require('../util').equalWith;


describe('helpers/app', function() {
  const root = pathUtil.join(__dirname, '../fixtures/core/app');
  const app = plover({ applicationRoot: root });
  const agent = request.agent(app.callback());


  it('quick render child view not found', function() {
    return agent.get('/app-helper/child-view-not-found')
      .expect(equal('app-helper-child-view-not-found.html'));
  });
});
