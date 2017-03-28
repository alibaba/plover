const pathUtil = require('path');
const scanDir = require('../../lib/util/scan-dir');


describe('util/scan-dir', function() {
  const dir = pathUtil.join(__dirname, '../fixtures/scan');

  const toRelative = path => pathUtil.relative(dir, path);

  it('scan dir files', function() {
    const list = scanDir(dir).map(toRelative);
    list.should.eql([
      'README.md',
      'a.txt',
      'assets/css/test.less',
      'assets/js/view.js',
      'b.txt',
      'dist/a.txt',
      'dist/b.txt',
      'package.json'
    ]);
  });


  it('scan dir with ignore rules', function() {
    const options = {
      ignore: ['package.json', 'README.md', 'README', 'dist/']
    };
    const list = scanDir(dir, options).map(toRelative);
    list.should.eql([
      'a.txt',
      'assets/css/test.less',
      'assets/js/view.js',
      'b.txt'
    ]);
  });


  it('scan dir with match rules', function() {
    const options = {
      match: ['a.txt'],
      ignore: ['*.txt', 'README.md', 'package.json', 'dist/']
    };

    const list = scanDir(dir, options).map(toRelative);
    list.should.eql([
      'a.txt',
      'assets/css/test.less',
      'assets/js/view.js'
    ]);
  });


  it('options.relative', function() {
    const options = {
      ignore: ['scan/package.json', 'scan/dist/'],
      relative: pathUtil.dirname(dir)
    };

    const list = scanDir(dir, options).map(toRelative);
    list.should.eql([
      'README.md',
      'a.txt',
      'assets/css/test.less',
      'assets/js/view.js',
      'b.txt'
    ]);
  });


  it('match only', function() {
    const options = {
      match: ['**/*.js', '*.json']
    };

    const list = scanDir(dir, options).map(toRelative);
    list.should.eql([
      'assets/js/view.js',
      'package.json'
    ]);
  });
});

