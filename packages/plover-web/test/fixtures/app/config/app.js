'use strict';


const pathUtil = require('path');


module.exports = {
  applicationRoot: pathUtil.join(__dirname, '..'),

  security: {
    headers: {
      'X-Frame-Options': false
    }
  },


  web: {
    keys: ['17e6b6bc6129097383dcad4fa1602233'],

    favicon: pathUtil.join(__dirname, '../public/favicon.ico'),
    rtime: {},
    conditional: {},
    etag: {},

    bodyParser: {},

    static: {},

    outputCharset: true,

    compress: {
      enable: true,
      filter: function(contentType) {
        return (/text/i.test(contentType));
      },
      threshold: 20,
      flush: require('zlib').Z_SYNC_FLUSH
    }
  }
};

