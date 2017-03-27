'use strict';


const fs = require('fs');
const pathUtil = require('path');


/**
 * 加载由目录中的`json`和`js`文件组织成的配置信息
 * 此方法采用同步方式加载文件，所以不能在请求会话中使用
 *
 * @param {String} dir  - 目录
 * @return {Object}     - 配置信息
 */
exports.load = function(dir) {
  const config = {};
  if (!fs.existsSync(dir)) {
    return config;
  }

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const path = pathUtil.join(dir, file);
    const ext = pathUtil.extname(path);
    const name = pathUtil.basename(file, ext);
    const stat = fs.statSync(path);

    const item = stat.isDirectory() ?
            tryLoadFromDir(path) : tryLoadFromFile(path);

    if (item) {
      config[name] = item;
    }
  }

  return config;
};


/*
 * 从目录加载配置信息
 */
function tryLoadFromDir(dir) {
  let path = null;
  try {
    path = require.resolve(dir);
  } catch (e) {
    // 忽略非模块的目录
    return null;
  }
  return require(path);
}


/*
 * 从文件加载配置信息
 */
function tryLoadFromFile(path) {
  const ext = pathUtil.extname(path);
  if (ext === '.js' || ext === '.json') {
    return require(path);
  }
  return null;
}

