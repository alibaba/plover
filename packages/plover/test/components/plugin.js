const pathUtil = require('path');
const co = require('co');
const request = require('supertest');

const plover = require('../../');


describe('components/plugin', function() {
  const root = pathUtil.join(__dirname, '../fixtures/components/plugin');
  const settings = { applicationRoot: root };

  it('可以加载并初始化插件', function() {
    const app = plover(settings);
    const agent = request(app.callback());

    return co(function* () {
      yield agent.get('/test')
          .expect('hello test');

      yield agent.get('/test-withorder')
          .expect('hello test-withorder');

      yield agent.get('/last')
          .expect('last');
    });
  });


  it('可以通过配置禁掉插件', function() {
    const app = plover({
      applicationRoot: root,
      plugins: {
        test: false,
        'test-withorder': {
          enable: false
        }
      }
    });

    const agent = request(app.callback());

    return co(function* () {
      yield agent.get('/test')
          .expect('last');
    });
  });


  it('还可以通过disable禁掉插件', function() {
    const app = plover({
      applicationRoot: root,
      plugins: {
        test: { disable: true }
      }
    });

    const agent = request(app.callback());
    return co(function* () {
      yield agent.get('/test')
        .expect('last');

      yield agent.get('/test-withorder')
        .expect('hello test-withorder');
    });
  });
});

