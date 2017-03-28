const pathUtil = require('path');


module.exports = {
  applicationRoot: pathUtil.join(__dirname, '..'),
  assets: {
    digest: true
  }
};
