const debug = require('debug')('plover-web:charset');


const map = {
  gbk: 1
};

const rCharset = /;\s+charset=([-\w]+)/i;


/*
 * 根据需要转换输出编码
 *
 * @param {Object} opts  参数
 *  - outputCharset 编码
 */
module.exports = function() {
  return async function OutputCharset(ctx, next) {
    await next();

    const charset = ctx.query._output_charset;   // eslint-disable-line
    if (!charset || !map[charset]) {
      return;
    }

    const body = ctx.body;
    if (typeof body === 'string') {
      debug('encode to %s', charset);
      const iconv = require('iconv-lite');
      ctx.body = iconv.encode(body, charset);

      const ctype = ctx.response.headers['content-type'];
      if (ctype) {
        const newCtype = ctype.replace(rCharset, '') + '; charset=' + charset;
        debug('set content-type: %s', newCtype);
        ctx.set('content-type', newCtype);
      }
    }
  };
};

