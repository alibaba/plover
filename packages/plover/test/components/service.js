const co = require('co');
const sinon = require('sinon');
const request = require('supertest');
const plover = require('../../');


describe('components/service', function() {
  const settings = { applicationRoot: 'somepath' };

  it('添加和使用服务', function() {
    const app = plover(settings);

    const calc = {
      add: function(a, b) {
        return a + b;
      }
    };

    app.addService('calc', calc);

    app.addMiddleware(function* () {
      this.body = '' + this.calc.add(1, 2);
    });

    (function() {
      app.addService('calc', calc);
    }).should.throw(/service name conflict: calc/);

    return request(app.callback())
      .get('/')
      .expect('3');
  });


  it('添加和使用多实例服务', function() {
    const Offer = function(ctx) {
      this.url = ctx.url;
      this.size = Offer.size;
    };

    Offer.startup = function() {
      Offer.size = 100;
    };

    // 没用过的服务不应该初始化
    const NotUsed = sinon.spy();

    const app = plover(settings);

    app.addService('offer', Offer);
    app.addService('not-used', NotUsed);

    app.addMiddleware(function* () {
      this.body = this.offer.url + '/' + this.offer.size;
    });

    return co(function* () {
      yield request(app.callback())
        .get('/hello')
        .expect('/hello/100');

      NotUsed.called.should.be.false();
    });
  });
});

