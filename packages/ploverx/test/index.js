const pathUtil = require('path');
const co = require('co');
const sinon = require('sinon');
const request = require('supertest');
const ploverx = require('../');


describe('ploverx', () => {
  let app = null;
  let agent = null;

  before(() => {
    const root = pathUtil.join(__dirname, 'fixtures/app');
    app = ploverx({ applicationRoot: root });
    agent = request(app.callback());
  });

  after(() => {
    app.__restoreLogger();  // eslint-disable-line
  });


  it('should run app with default plugins', () => {
    return agent.get('/hello')
      .expect(/<h1>Hello<\/h1>/);
  });


  it('server static file', () => {
    return agent.get('/ok.txt').expect('ok!\n');
  });


  it('logger with winston', () => {
    return co(function* () {
      yield agent.get('/logger')
        .expect('logger info');

      yield agent.get('/logger?level=warn')
        .expect('logger warn');


      yield agent.get('/logger?level=error')
        .expect('logger error');
    });
  });


  it('app.run', () => {
    sinon.spy(app, 'listen');
    app.run();
    app.listen.calledWith(4000).should.be.true();
    app.listen.restore();
  });
});
