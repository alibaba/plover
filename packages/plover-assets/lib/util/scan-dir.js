const fs = require('fs');
const pathUtil = require('path');
const minimatch = require('minimatch');


const debug = require('debug')('plover-assets-util:scan-dir');


/**
 * scan dir files with ignore or match rules
 *
 * @param {String} dir - dir for scan
 * @param {Object} options - options
 * {
 *  match: {Array}     -  match rules
 *  ignore: {Array}    - ignore rules
 *  relative: {String} - relative path, use dir for default
 * }
 * @return {Array}    - paths
 */
module.exports = function(dir, options) {
  options = options || {};

  const results = [];

  const opts = {
    dirMatch: [],
    fileMatch: [],
    dirIgnore: [],
    fileIgnore: [],
    relative: options.relative || dir
  };

  makeRules(options.match, opts.dirMatch, opts.fileMatch);
  makeRules(options.ignore, opts.dirIgnore, opts.fileIgnore);

  const matchOnly = options.match && !options.ignore;
  opts.fileMatchOnly = matchOnly && opts.fileMatch.length;
  opts.dirMatchOnly = matchOnly && !opts.fileMatch.length;

  scan(dir, dir, opts, results);

  return results;
};


function scan(root, dir, options, results) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const path = pathUtil.join(dir, file);
    const stat = fs.statSync(path);
    const rpath = pathUtil.relative(options.relative, path);

    /* istanbul ignore else  */
    if (stat.isFile()) {
      if (test(
        file, rpath,
        options.fileMatch, options.fileIgnore, options.fileMatchOnly
      )) {
        results.push(path);
      }
    } else if (stat.isDirectory()) {
      if (test(
        file, rpath,
        options.dirMatch, options.dirIgnore, options.dirMatchOnly
      )) {
        scan(root, path, options, results);
      }
    }
  });
}


function makeRules(patterns, dirRules, fileRules) {
  const rDir = /\/$/;
  const toRe = pattern => minimatch.makeRe(pattern);
  patterns && patterns.forEach(pattern => {
    if (rDir.test(pattern)) {
      pattern = pattern.replace(rDir, '');
      dirRules.push(toRe(pattern));
    } else {
      fileRules.push(toRe(pattern));
    }
  });
}


/* eslint max-params: [2, 5] */
function test(file, rpath, match, ignore, matchOnly) {
  debug(
    'test: %s, match: %o, ignore: %o, matchOnly: %s',
    rpath, match, ignore, matchOnly
  );

  const fn = re => re.test(rpath);
  if (match.length && match.some(fn)) {
    return true;
  }
  if (matchOnly) {
    return false;
  }
  if (ignore.length && ignore.some(fn)) {
    return false;
  }
  return !file.startsWith('.');
}

