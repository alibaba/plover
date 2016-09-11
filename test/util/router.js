'use strict';


const Router = require('../../lib/util/router');


describe('util/router', function() {
  it('可以路由url', function() {
    const router = new Router();
    router.add('/offer/:offerId(\\d+)(\\.html)?',
        'offer:view');

    router.route('/offer/123').should.eql({
      module: 'offer',
      action: 'view',
      query: {
        offerId: '123'
      }
    });

    router.route('/offer/123').should.eql({
      module: 'offer',
      action: 'view',
      query: {
        offerId: '123'
      }
    });

    router.route('/offer/123.html').should.eql({
      module: 'offer',
      action: 'view',
      query: {
        offerId: '123'
      }
    });


    (router.route('/offer/hello') === null).should.be.true();
  });


  it('也可以使用/分隔action', function() {
    const router = new Router();
    router.add('/offer/:id(\\d+)', 'offer/view');
    router.route('/offer/123').should.eql({
      module: 'offer',
      action: 'view',
      query: {
        id: '123'
      }
    });
  });


  it('可以在rule中使用query参数', function() {
    const router = new Router();
    router.add('/offer-(\\w+)-:offerId(\\d+)-(\\w+)-:feature([a-z]+)',
      'offer:view?cat=$1&group=$2');
    router.route('/offer-food-123-liquid-red').should.eql({
      module: 'offer',
      action: 'view',
      query: {
        cat: 'food',
        offerId: '123',
        group: 'liquid',
        feature: 'red'
      }
    });
  });


  it('可以在rule中声明特殊参数', function() {
    const router = new Router();
    router.add('/special-:offerId(\\d+)',
      'offer/view?_plover_layout=special');

    router.route('/special-123').should.eql({
      module: 'offer',
      action: 'view',
      query: {
        offerId: '123'
      },
      layout: 'special'
    });
  });


  it('无效的规则', function() {
    const router = new Router();

    (function() {
      router.add('/any', 'offer?hello');
    }.should.throw());
  });


  it('没有规则', function() {
    const router = new Router();
    (router.route('/index') === null).should.be.true();
  });


  it('模块名称包含/也能正常工作', function() {
    const router = new Router();
    router.add('/admin-user', 'admin/user:view');
    router.add('/admin-offer', 'admin/user/offer');

    router.route('/admin-user').should.eql({
      module: 'admin/user',
      action: 'view',
      query: {}
    });

    router.route('/admin-offer').should.eql({
      module: 'admin/user',
      action: 'offer',
      query: {}
    });
  });


  it('升级path-to-regexp > 1.3.0 后以下规则通不过', function() {
    const router = new Router();
    router.add('/design/page/:_plover_module/:_plover_action?:extname(\\.html?|\\.shtml?)?', '_/_'); // eslint-disable-line
    router.route('/design/page/preview.shtml').should.eql({
      module: 'preview',
      action: undefined,
      query: {
        extname: '.shtml'
      }
    });
  });


  it('默认规则', function() {
    const router = new Router();
    /* eslint-disable */
    router.add(/^\/([a-zA-Z][-\w]*?)(?:\/([a-zA-Z][-\w]*?))?(?:\.(?:html|htm|json|jsonp))?\/?$/,
        { module: '$1', action: '$2' });
    /* eslint-enable */
    router.add(/^\/$/, { module: 'index', action: 'view' });

    router.route('/index.html').should.eql({
      module: 'index',
      action: undefined,
      query: {
      }
    });

    router.route('/offer/update').should.eql({
      module: 'offer',
      action: 'update',
      query: {}
    });

    router.route('/offer/').should.eql({
      module: 'offer',
      action: undefined,
      query: {}
    });

    router.route('/').should.eql({
      module: 'index',
      action: 'view',
      query: {}
    });

    (router.route('/123') === null).should.be.ok();
  });
});

