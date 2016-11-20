'use strict';


const mm = require('plover-test-mate');
const co = require('co');


describe('plover-route/lib/plugin', () => {
  it('config routes', () => {
    const app = mm({
      applicationRoot: __dirname
    });

    app.config.routes = (r) => {
      r.get('/profile', 'users#show');
      r.use('/hello', function* () {
        this.body = 'hello';
      });
    };

    app.use(require('../lib/plugin'));

    app.addMiddleware(function* () {
      if (this.route) {
        this.body = this.route;
      }
    });


    return co(function* () {
      yield app.get('/profile').expect({
        module: 'users',
        action: 'show',
        query: {}
      });

      yield app.get('/hello').expect('hello');
    });
  });


  it('routes not config', () => {
    const app = mm({
      applicationRoot: __dirname
    });

    app.use(require('../lib/plugin'));

    (true).should.be.ok();
  });
});
