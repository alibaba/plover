'use strict';

const pathUtil = require('path');
const Resolver = require('..');

const getModuleInfo = Resolver.getModuleInfo;


/* global __dirname, setTimeout */


describe('plover-module-resolver', function() {
  const root = pathUtil.join(__dirname, './fixtures/app');

  it('#resolve', function() {
    const resolver = new Resolver({ applicationRoot: root });

    resolver.list().should.not.be.empty();

    resolver.resolve('index').should.eql({
      name: 'index',
      version: '0.0.0',
      assets: true,
      assetsRoot: 'assets/',
      path: pathUtil.join(root, 'modules/index'),
      views: {
        view: {
          template: 'views/view.art',
          js: 'js/view.js',
          css: 'css/view.css'
        }
      }
    });

    resolver.resolve('offer').should.eql({
      name: 'offer',
      version: '0.0.0',
      path: pathUtil.join(root, 'modules/offer'),
      views: {
        item: {
          js: undefined,
          css: undefined,
          template: 'views/item.art'
        }
      }
    });
  });


  it('非开发态时, module是有缓存的', function() {
    const resolver = new Resolver({ applicationRoot: root });
    const info = resolver.resolve('index');
    info.should.not.be.empty();
    resolver.resolve('index').should.be.equal(info);
  });


  it('开发态时，每次都重新加载module', function(done) {
    Resolver.CACHE_TIMEOUT = 100;
    const resolver = new Resolver({
      applicationRoot: root,
      development: true
    });

    const one = resolver.resolve('index');
    one.should.not.be.empty();

    const two = resolver.resolve('index');
    one.should.be.equal(two);

    setTimeout(function() {
      const three = resolver.resolve('index');
      one.should.not.be.equal(three);
      one.should.be.eql(three);

      const notexists = resolver.resolve('notexists');
      (notexists === undefined).should.be.true();

      done();
    }, 200);
  });


  it('开发时，标识为reload: false的模块也不会重新加载', function(done) {
    Resolver.CACHE_TIMEOUT = 100;
    const resolver = new Resolver({
      applicationRoot: root,
      development: true
    });

    const one = resolver.resolve('noreload');
    setTimeout(function() {
      const two = resolver.resolve('noreload');
      one.should.be.equal(two);

      done();
    }, 200);
  });


  it('modules文件夹并不存在时，也不能报错', function() {
    const resolver = new Resolver({ applicationRoot: 'notexists' });
    const info = resolver.resolve('index');
    (info === undefined).should.be.true();
  });


  it('可以使用node-modules下的模块', function() {
    const resolver = new Resolver({
      applicationRoot: root
    });

    let info = resolver.resolve('item');
    info.should.not.empty();

    info = resolver.resolve('not');
    (info === undefined).should.be.true();
  });


  it('使用modulesDir和libModulesDir自定义模块目录', function() {
    const libRoot = pathUtil.join(__dirname, './fixtures/app-lib');
    const libRootNoDeps = pathUtil.join(__dirname, './fixtures/app-lib-no-deps');
    const resolver = new Resolver({
      applicationRoot: root,

      modulesDir: {
        default: pathUtil.join(root, 'modules'),
        tpl: pathUtil.join(root, 'tpl-modules')
      },

      libModulesDir: [libRoot, libRootNoDeps, root]
    });

    resolver.resolve('other-item').should.not.empty();

    let info = resolver.resolve('tpl/big-offers');
    info.should.not.be.empty();

    info = resolver.resolve('offer');
    info.path.should.be.equal(pathUtil.join(root, 'modules/offer'));

    info = resolver.resolve('less');
    info.should.not.be.empty();

    (resolver.resolve('webpack') === undefined).should.be.true();
  });


  it('#list() - 取得模块列表', function() {
    const resolver = new Resolver({
      applicationRoot: root
    });

    const list = resolver.list();
    list.should.be.Array();
  });


  it('#loadModule(path)', function() {
    const resolver = new Resolver({ applicationRoot: root });
    resolver.loadModule(pathUtil.join(__dirname, 'fixtures/hello'));
    resolver.resolve('hello').should.not.empty();

    const path = pathUtil.join(__dirname, 'notexists');
    (function() {
      resolver.loadModule(path);
    }).should.throw(/invalid module/);

    // 加载不到不出异常
    resolver.loadModule(path, { silent: true });
  });


  it('#pushModule(info)', function() {
    const resolver = new Resolver({ applicationRoot: root });
    const info = getModuleInfo(pathUtil.join(__dirname, 'fixtures/hello'));
    resolver.pushModule(info);
    resolver.resolve('hello').should.not.empty();
  });


  it('名字冲突时会出异常', function() {
    (function() {
      const resolver = new Resolver({
        applicationRoot: root,
        modulesDir: pathUtil.join(root, 'conflict')
      });

      resolver.list();
    }).should.throw(/module conflict/);
  });


  describe('模块依赖检测', function() {
    function test(title, dir, error) {
      it(title, function() {
        const resolver = new Resolver({
          applicationRoot: root,
          modulesDir: pathUtil.join(__dirname, 'fixtures', dir)
        });

        if (error) {
          (function() {
            resolver.vertify();
          }).should.throw(error);
        } else {
          resolver.vertify();
        }
      });
    }

    test('依赖的模块版本不兼容', 'dep-not-compatible',
      'b@2.0.0 is not compatible with a which depend on b@~1.0.0');

    test('依赖的模块不存在', 'dep-not-exists',
      'the module b which is required by a can not be found.');

    test('依赖的模块版本兼容', 'dep-ok');
  });
});

