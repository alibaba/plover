

const assign = require('..').assign;


describe('plover-util/lib/assign', function() {
  it('test', function() {
    const des = {};
    const des2 = assign(des, { a: 1 }, { a: 2, b: 3 });
    des.should.equal(des2);
    des2.should.eql({ a: 2, b: 3 });

    assign({ k: 123 }, { b: undefined, c: null })
      .should.eql({ k: 123, b: undefined, c: null });
  });
});
