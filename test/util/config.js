'use strict';


const Path = require('path');

const config = require('../../lib/util/config');


describe('util/config', function() {
  it('可以载入目录中的配置信息', function() {
    let path = Path.join(__dirname, '../fixtures/util/config/config');
    let o = config.load(path);
    o.should.eql({
      app: {
        port: 4100
      },

      edit: {
        name: 'plover'
      },

      urls: {
        google: 'http://www.google.com',
        baidu: 'http://www.baidu.com'
      }

    });

    path = Path.join(__dirname, 'not-exists');
    o = config.load(path);
    o.should.eql({});
  });


  it('载入出错时会抛出异常', function() {
    const path = Path.join(__dirname, '../fixtures/util/config/invalid-config');
    (function() {
      config.load(path);
    }.should.throw());
  });


  it('忽略非json|js的文件', function() {
    const path = Path.join(__dirname, '../fixtures/util/config/ignore-config');
    const o = config.load(path);
    o.should.eql({ a: { name: 'hello' } });
  });
});

