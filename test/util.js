'use strict';


const pathUtil = require('path');
const fs = require('fs');


exports.fixture = function(path) {
  path = pathUtil.join(__dirname, 'fixtures', path);
  return fs.readFileSync(path, 'utf-8');
};


exports.htmlEqual = function(html) {
  return function(res) {
    trimSpace(res.text).should.equal(trimSpace(html));
  };
};


/*
 * 标签之间的多个空格或空行变成一个
 */
function trimSpace(html) {
  return html.trim().replace(/(>\s)\s+/g, '$1').replace(/\s+(\s<)/g, '$1');
}
