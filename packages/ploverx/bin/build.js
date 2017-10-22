#!/usr/bin/env node

const assert = require('assert');
const pathUtil = require('path');
const co = require('co');
const Builder = require('plover-assets/lib/builder');
const util = require('../lib/util');


/* eslint no-console: 0, no-process-exit: 0, no-process-env: 0 */


module.exports = build;


function build(opts) {
  opts = Object.assign({}, opts);

  const appRoot = opts.applicationRoot;
  assert(appRoot, '`options.applicationRoot` required');
  opts.outputDir = opts.outputDir || pathUtil.join(appRoot, 'public');

  const settings = util.loadSettings(appRoot);
  console.log('build assets %s -> %s', appRoot, opts.outputDir);

  const builder = new Builder(settings);
  return co(function* () {
    yield builder.buildApp(opts);
  });
}


/* istanbul ignore next */
if (require.main === module) {
  // 标识编译过程，可在配置中使用
  process.env.PLOVER_ASSETS_BUILD = 'true';

  const program = require('commander');
  program
    .version(require('../package.json').version)
    .option('--applicationRoot [applicationRoot]')
    .option('-o, --outputDir [outputDir]', 'output dir')
    .parse(process.argv);

  const appRoot = program.applicationRoot ?
    pathUtil.resolve(program.applicationRoot) : process.cwd();
  const outputDir = program.outputDir && pathUtil.resolve(program.outputDir);

  const opts = {
    applicationRoot: appRoot,
    outputDir: outputDir
  };

  build(opts)
    .then(() => console.log('BUILD_SUCCESS'))
    .catch(e => {
      console.error('BUILD_ERROR');
      e = e || {};
      console.error(e.stack || e);
      process.exit(1);
    });
}

