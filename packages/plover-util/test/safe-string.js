

const SafeString = require('..').SafeString;


describe('plover-util/lib/safe-string', function() {
  it('use as string', function() {
    let s = new SafeString('<div></div>');
    s.toString().should.equal('<div></div>');
    s.toHTML().should.equal('<div></div>');

    s = new SafeString(123);
    s.toString().should.equal('123');
  });
});
