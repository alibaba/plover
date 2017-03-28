const concatUrl = require('../../lib/util/concat-url');


describe('util/concat-url', function() {
  it('should concat url', function() {
    concatUrl('http://assets??', ['a.js', 'b.js'])
      .should.eql(['http://assets??a.js,b.js']);
  });


  it('should return muti urls when url lenth > 1500', function() {
    const list = [];
    for (let i = 0; i < 1000; i++) {
      list.push('a.js');
    }
    const prefix = 'http://assets??';
    const urls = concatUrl(prefix, list);
    (urls.length > 1).should.be.true();
    for (const url of urls) {
      (url.length < 1600).should.be.true();
    }
  });


  it('for coverage', function() {
    const url = 'a.js';
    const times = Math.floor(1500 / (url.length + 1)) + 1;
    const list = [];
    for (let i = 0; i < times; i++) {
      list.push(url);
    }
    const prefix = 'http://assets??';
    const urls = concatUrl(prefix, list);
    urls.length.should.equal(1);
  });
});

