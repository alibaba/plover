

const pathUtil = require('path');

const getModuleInfo = require('../lib/get-module-info');


/* global __dirname */


describe('plover-module-resolver/lib/getModuleInfo(path)', function() {
  it('取得模块信息', function() {
    const path = pathUtil.join(__dirname, 'fixtures/hello');
    const info = getModuleInfo(path);
    info.should.eql({
      name: 'hello',
      version: '0.0.0',
      assets: true,
      assetsRoot: 'assets/',
      path: path,
      views: {
        view: {
          template: 'views/view.art',
          js: 'js/view.js',
          css: 'css/view.css'
        },

        item: {
          template: 'views/item.ejs',
          js: undefined,
          css: 'css/item.css'
        },

        edit: {
          template: 'views/edit.form',
          js: 'js/edit.js',
          css: undefined
        },

        'controls/shop': {
          template: 'views/controls/shop.art',
          js: undefined,
          css: 'css/controls/shop.css'
        }
      }
    });
  });


  it('空目录不算模块或目录不存都不算模块', function() {
    const path = pathUtil.join(__dirname, 'fixtures/empty');
    let info = getModuleInfo(path);
    (!!info).should.not.be.ok();

    info = getModuleInfo('notexist');
    (!!info).should.not.be.ok();
  });


  it('package.json存在plover节点不存在也不能算模块', function() {
    const path = pathUtil.join(__dirname, 'fixtures/withpkg');
    const info = getModuleInfo(path);
    (!!info).should.not.be.ok();
  });


  it('没有package.json的模块', function() {
    const path = pathUtil.join(__dirname, 'fixtures/simple');
    const info = getModuleInfo(path);
    info.should.eql({
      name: 'simple',
      version: '0.0.0',
      path: path,
      views: {}
    });
  });


  it('纯assets模块', function() {
    const path = pathUtil.join(__dirname, 'fixtures/pureassets');
    const info = getModuleInfo(path);
    info.should.eql({
      name: 'pureassets',
      version: '0.0.0',
      path: path,
      views: {},
      assets: true,
      assetsRoot: ''
    });
  });


  it('不包含assets的模块', function() {
    const path = pathUtil.join(__dirname, 'fixtures/noassets');
    const info = getModuleInfo(path);
    info.should.eql({
      name: 'noassets',
      version: '0.0.0',
      path: path,
      views: {}
    });
  });


  it('无效的package.json会输出文件路径信息方便排查', function() {
    const path = pathUtil.join(__dirname, 'fixtures/invalid-json');
    const pkgPath = pathUtil.join(path, 'package.json');
    (function() {
      getModuleInfo(path);
    }).should.throw(`invalid json file: ${pkgPath}`);
  });
});

