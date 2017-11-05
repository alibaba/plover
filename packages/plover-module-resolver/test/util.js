

const pathUtil = require('path');
const util = require('../lib/util');


describe('plover-moduler-resolver/lib/util', function() {
  it('util.isPloverModule', function() {
    const root = pathUtil.join(__dirname, 'fixtures/app/node_modules');
    util.isPloverModule(pathUtil.join(root, 'ignore')).should.be.false();
    util.isPloverModule(pathUtil.join(root, 'item')).should.be.true();
    util.isPloverModule(pathUtil.join(root, 'not')).should.be.false();
  });
});
