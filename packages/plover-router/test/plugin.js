'use strict';


const plover = require('../../../');

const request = require('supertest');
const plugin = require('../lib/plugin');
const co = require('co');


describe('plugin', () => {
  it('config routes', () => {
    const settings = {
      applicationRoot: __dirname
    };

    const app = plover(settings);
    app.config.routes = (r) => {
      r.get('/profile', 'users#show');
      r.use('/hello', function* () {
        this.body = 'hello';
      });
    };

    plugin(app);

    app.addMiddleware(function* () {
      if (this.route) {
        this.body = this.route;
      }
    });

    const agent = request.agent(app.callback());
    return co(function* () {
      yield agent.get('/profile').expect({
        module: 'users',
        action: 'show',
        query: {}
      });

      yield agent.get('/hello').expect('hello');
    });
  });
});
