'use strict';


const pathUtil = require('path');
const request = require('supertest');

const plover = require('../../');
const util = require('../util');


/* eslint max-nested-callbacks: [2, 4] */


describe('core/navigator', function() {
  const root = pathUtil.join(__dirname, '../fixtures/core/navigator');

  describe('渲染页面', function() {
    const app = plover({ applicationRoot: root });
    const agent = request.agent(app.callback());

    it('正常渲染一个页面', function() {
      return agent.get('/index')
          .expect(equal('index.html'));
    });


    it('返回json结果', function() {
      return agent.get('/api/offer')
          .expect({ id: 123, name: 'test offer' });
    });
  });


  describe('使用service', function() {
    beforeEach(function() {
      const app = plover({
        applicationRoot: root,
        // 配置方式
        services: {
          productService: './lib/services/product-service.js'
        }
      });

      const path = pathUtil.join(root, './lib/services/code-service.js');
      app.addService('codeService', require(path));

      this.app = app;
    });


    it('中间件中使用Serivce', function() {
      this.app.addMiddleware(function* () {
        const id = this.query.id;
        const product = this.productService.get(id);
        this.body = {
          id: product.id,
          name: product.name
        };
      });

      return request(this.app.callback())
        .get('/?id=1234')
        .expect({ id: '1234', name: 'product-1234' });
    });


    it('控制器中使用Service', function() {
      return request(this.app.callback())
        .get('/service.json?id=456')
        .expect({ id: '456', name: 'product-456' });
    });
  });


  it('使用filter', function() {
    const app = plover({
      applicationRoot: root,
      filters: ['./lib/filters/box.js']
    });

    return request(app.callback())
      .get('/index?layout=false')
      .expect(equal('index-with-filter.html'));
  });


  describe('通过route设置layout', function() {
    const app = plover({
      applicationRoot: root,
      routes: {
        '/:_plover_module/bare': '_:view?_plover_layout=false',
        '/:_plover_module/mobile': '_:view?_plover_layout=layouts:mobile'
      }
    });

    const agent = request.agent(app.callback());

    it('使用路由关闭layout', function() {
      return agent.get('/index/bare')
        .expect(equal('index-with-layout-false.html'));
    });

    it('使用路由设置layout', function() {
      return agent.get('/index/mobile')
        .expect(equal('index-with-layout-mobile.html'));
    });

    it('coverage for inner view', function() {
      return agent.get('/index?banner=true')
        .expect(equal('index-with-banner.html'));
    });
  });
});


function equal(path) {
  path = pathUtil.join('core/navigator/expects/' + path);
  return util.htmlEqual(util.fixture(path));
}
