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


exports.equalWith = function(path) {
  path = pathUtil.join('expects', path);
  return exports.htmlEqual(exports.fixture(path));
};


/*
 * 去掉标签之前和之后的空格
 */
function trimSpace(html) {
  return html.trim().replace(/>\s+/g, '>').replace(/\s+</g, '<');
}
