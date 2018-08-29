const fs = require('fs-extra');
const pathUtil = require('path');
const minimatch = require('minimatch');
const scanDir = require('../util/scan-dir');
const util = require('../util/util');
const handler = require('../handler');


const debug = require('debug')('plover-assets:builder/build-module');


/* eslint no-console: 0 */


const rExt = /(\.\w+)$/;


/**
 * 编译模块
 *
 * @param {Object} app  - 构建应用对象
 *  - moduleResolver        - 模块解析器
 *  - settings              - 配置
 *
 * @param {Object} info - 模块信息
 *
 * @param {Object} args - 其他参数
 *  - outputDir             - 输出目录
 */
module.exports = function* (app, info, args) {
  if (!info.assets) {
    return;
  }

  console.log('build module: %s@%s', info.name, info.version);

  const settings = app.settings;

  const assetsRoot = pathUtil.join(info.path, info.assetsRoot);
  const outputDir = args.outputDir;

  let list = scanDir(assetsRoot, {
    ignore: [
      'node_modules/',
      'README',
      'README.md',
      'package.json'
    ]
  });
  const buildConfig = yield util.loadBuildConfig(info);
  list = filter(settings.applicationRoot, list, buildConfig);

  for (const path of list) {
    yield* buildFile(app, path, {
      info: info,
      assetsRoot: assetsRoot,
      outputDir: outputDir
    });
  }
};


/*
 * 过滤掉忽略的文件
 * 匹配ignore规则，不匹配include规则，则忽略
 */
function filter(root, list, config) {
  config = config || {};

  const ignoreRules = config.ignore || [];
  const matchRules = config.match || [];

  return list.filter(path => {
    const rpath = pathUtil.relative(root, path);

    const test = rule => minimatch(rpath, rule);
    if (matchRules.some(test)) {
      return true;
    }
    if (ignoreRules.some(test)) {
      return false;
    }
    return true;
  });
}


function* buildFile(app, path, options) {
  const info = options.info;
  const outputDir = options.outputDir;
  const assetsRoot = options.assetsRoot;

  debug('try process: %s\n%o', path, info);

  let outpath = pathUtil.join(outputDir, pathUtil.relative(assetsRoot, path));
  fs.ensureDirSync(pathUtil.dirname(outpath));

  const o = yield* handler.compile(path, info, {
    moduleResolver: app.moduleResolver,
    settings: app.settings
  });

  if (o) {
    if (o.type) {
      outpath = outpath.replace(rExt, '.' + o.type);
    }
    debug('compile to %s', outpath);
    fs.writeFileSync(outpath, o.code);
    o.map && writeSourceMap(outpath, o.map);
  } else {
    debug('copy to %s', outpath);
    fs.copySync(path, outpath);
  }
}


function writeSourceMap(path, map) {
  const mapPath = pathUtil.join(pathUtil.dirname(path), map.file);
  if (path !== mapPath) {
    fs.writeFileSync(mapPath, JSON.stringify(map));
  } else {
    console.warn('map file is same as source file, ignore');    // eslint-disable-line
  }
}

