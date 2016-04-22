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
    app.addEngine('art', require('plover-arttemplate'));
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
});


function equal(path) {
  path = pathUtil.join('core/navigator/expects/' + path);
  return util.htmlEqual(util.fixture(path));
}
