const fs = require('fs');
const pathUtil = require('path');
const sinon = require('sinon');
const request = require('supertest');

const plover = require('../../');
const equal = require('../util').equalWith;


/* eslint max-nested-callbacks: [2, 4], require-yield: 0 */


describe('core/navigator', function() {
  const root = pathUtil.join(__dirname, '../fixtures/core/app');
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


  it('使用filter', async function() {
    const thisApp = plover({
      applicationRoot: root,
      filters: ['./lib/filters/box.js']
    });

    const filter = require(pathUtil.join(root, './lib/filters/api.js'));
    thisApp.addFilter(filter, { match: '/api/*' });

    const thisAgent = request.agent(thisApp.callback());

    await thisAgent.get('/index?layout=false')
      .expect(equal('index-with-filter.html'));

    await thisAgent.get('/api/offer')
      .expect('X-API', '112233')
      .expect({ id: 123, name: 'test offer' });
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


  it('es6 class as controller', function() {
    return agent.get('/es6-class/getData.json')
      .expect({ name: 'plover' });
  });


  it('开发模式下，控制器有更新会自动生效', async function() {
    const thisApp = plover({
      applicationRoot: root,
      env: 'development'
    });

    const r = request.agent(thisApp.callback());

    await r.get('/dev').expect('dev');

    // 更新controller
    const src = pathUtil.join(root, 'modules/dev/index.js');
    const des = pathUtil.join(root, 'modules/dev/index-update.js');
    const bak = src + '.bak';
    fs.renameSync(src, bak);
    fs.renameSync(des, src);

    await r.get('/dev').expect('dev-update');
    fs.renameSync(src, des);
    fs.renameSync(bak, src);
  });


  it('controller语法错误', function() {
    const thisApp = plover({ applicationRoot: root, env: 'development' });
    const path = pathUtil.join(root, 'modules/syntax-error/index.js');
    const Logger = require('plover-logger');
    sinon.stub(Logger.prototype, 'error');
    return request(thisApp.callback()).get('/syntax-error')
      .expect(res => {
        const expect = 'load controller error: ' + path;
        (res.text.indexOf(expect) > 0).should.be.true();

        Logger.prototype.error.called.should.be.true();
        Logger.prototype.error.restore();
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

    it('settings.defaultLayout', function() {
      const myapp = plover({
        applicationRoot: root,
        env: 'production',
        defaultLayout: 'layouts#index'
      });
      return request(myapp.callback())
        .get('/index')
        .expect(equal('index-with-default-layout.html'));
    });
  });


  describe('数据类型', function() {
    it('渲染Buffer', function() {
      return agent.get('/buffer')
        .expect(200)
        .expect(Buffer.from('hello world'));
    });
  });
});
