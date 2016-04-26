'use strict';


const pathUtil = require('path');
const sinon = require('sinon');
const request = require('supertest');
const Logger = require('plover-logger')

const util = require('../util');
const plover = require('../../');


describe('core/view-render', function() {
  const root = pathUtil.join(__dirname, '../fixtures/core/app');
  const app = plover({ applicationRoot: root });
  const agent = request.agent(app.callback());

  beforeEach(function() {
    sinon.stub(Logger.prototype, 'error');
  });

  afterEach(function() {
    if (this.expectError) {
      Logger.prototype.error.called.should.be.true();
      const e = Logger.prototype.error.args[0][0];
      e.message.match(this.expectError);
      this.expectError = null;
    }
    Logger.prototype.error.restore();
  });


  it('render children', function() {
    return agent.get('/child')
      .expect(equal('child.html'));
  });


  it('view not found', function() {
    return agent.get('/child/view-not-found')
      .expect(/Not Found/);
  });


  it('view render error', function() {
    this.expectError = /some error happen/;
    return agent.get('/child/renderError')
      .expect(500);
  });


  it('render child error', function() {
    this.expectError = /some error happen/;
    return agent.get('/child/renderChildError')
      .expect(200);
  });


  it('render other module view', function() {
    return agent.get('/index/offer')
      .expect(equal('index-offer.html'));
  });


  it('engine not found', function() {
    this.expectError = /render engine not exists: xml/;
    return agent.get('/index/engine-not-found')
      .expect(500);
  });


  describe('env production', function() {
    const myapp = plover({ applicationRoot: root, env: 'production' });
    const pagent = request.agent(myapp.callback());

    it('quick render', function() {
      return pagent.get('/child')
        .expect(equal('child-production.html'));
    });

    it('render child error', function() {
      this.expectError = /some error happen/;
      return pagent.get('/child/renderChildError')
        .expect(200);
    });
  });


  describe('with controller filter', function() {
    it('general render', function() {
      return agent.get('/filter')
        .expect('<div>filter</div>\n');
    });

    it('beforeRender break with body', function() {
      return agent.get('/filter?break=true&body=true')
        .expect('break in beforeRender');
    });

    it('beforeRender break with not found', function() {
      return agent.get('/filter?break=true')
        .expect(404);
    });

    it('filter body in after render', function() {
      return agent.get('/filter?filterAfter=true')
        .expect('after:<div>filter</div>\n');
    });
  });
});


function equal(path) {
  path = 'core/app/expects/' + path;
  return util.htmlEqual(util.fixture(path));
}

