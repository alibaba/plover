'use strict';


const fs = require('fs');
const pathUtil = require('path');
const co = require('co');
const request = require('supertest');

const plover = require('../../');
const util = require('../util');


/* eslint max-nested-callbacks: [2, 4] */


describe('core/navigator', function() {
  const root = pathUtil.join(__dirname, '../fixtures/core/navigator');
  const app = plover({ applicationRoot: root, env: 'production' });
  const agent = request.agent(app.callback());

  describe('渲染页面', function() {
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
      const thisApp = plover({
        applicationRoot: root,
        // 配置方式
        services: {
          productService: './lib/services/product-service.js'
        }
      });

      const path = pathUtil.join(root, './lib/services/code-service.js');
      thisApp.addService('codeService', require(path));

      this.app = thisApp;
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
    const thisApp = plover({
      applicationRoot: root,
      filters: ['./lib/filters/box.js']
    });

    return request(thisApp.callback())
      .get('/index?layout=false')
      .expect(equal('index-with-filter.html'));
  });


  describe('通过route设置layout', function() {
    const thisApp = plover({
      applicationRoot: root,
      routes: {
        '/:_plover_module/bare': '_:view?_plover_layout=false',
        '/:_plover_module/mobile': '_:view?_plover_layout=layouts:mobile'
      }
    });

    const r = request.agent(thisApp.callback());

    it('使用路由关闭layout', function() {
      return r.get('/index/bare')
        .expect(equal('index-with-layout-false.html'));
    });

    it('使用路由设置layout', function() {
      return r.get('/index/mobile')
        .expect(equal('index-with-layout-mobile.html'));
    });

    it('coverage for inner view', function() {
      return r.get('/index?banner=true')
        .expect(equal('index-with-banner.html'));
    });
  });


  describe('404场景', function() {
    it('请求不存在的action', function() {
      return agent.get('/index/notfound')
        .expect(404);
    });

    it('layout module not exists', function() {
      return agent.get('/index/layoutNotFound')
        .expect(404);
    });
  });


  it('Controller可以是个类，目前是做了简单处理，后续好好规划下Controller特性', function() {
    return agent.get('/es6-class/getData.json')
      .expect({ name: 'plover' });
  });


  it('开发模式下，控制器有更新会自动生效', function() {
    const thisApp = plover({
      applicationRoot: root,
      env: 'development'
    });

    const r = request.agent(thisApp.callback());

    return co(function* () {
      yield r.get('/dev').expect('dev');

      // 更新controller
      const src = pathUtil.join(root, 'modules/dev/index.js');
      const des = pathUtil.join(root, 'modules/dev/index-update.js');
      const bak = src + '.bak';
      fs.renameSync(src, bak);
      fs.renameSync(des, src);

      yield r.get('/dev').expect('dev-update');
      fs.renameSync(src, des);
      fs.renameSync(bak, src);
    });
  });


  describe('Action返回result', function() {
    it('this.navigate()', function() {
      return agent.get('/index/navigate')
        .expect(equal('index.html'));
    });

    it('yield this.navigate()', function() {
      return agent.get('/index/navigate?yield=true')
        .expect(equal('index.html'));
    });

    it('return false', function() {
      return agent.get('/index/returnFalse')
        .expect(404);
    });

    it('set body', function() {
      return agent.get('/index/setBody')
        .expect('hello world');
    });
  });


  describe('layout相关', function() {
    it('simple layout', function() {
      return agent.get('/index?layout=layouts:simple')
        .expect(equal('index-with-layout-simple.html'));
    });

    it('invalid layout', function() {
      return agent.get('/index?layout=layouts:invalid')
        .expect(404);
    });
  });
});


function equal(path) {
  path = pathUtil.join('core/navigator/expects/' + path);
  return util.htmlEqual(util.fixture(path));
}
