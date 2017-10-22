const pathUtil = require('path');
const fse = require('fs-extra');
const winston = require('winston');
const Logger = require('plover-logger');

const LEVEL = { error: 1, warn: 2, info: 3, debug: 4 };

module.exports = function(settings) {
  const map = settings.loggers || {};
  const list = [];
  for (const name in map) {
    list.push(create(name, map[name]));
  }
  if (!list.length) {
    return function() {};
  }

  const isEnabled = Logger.prototype.isEnabled;
  const handler = Logger.prototype.handler;

  Logger.prototype.isEnabled = function(level) {
    const v = LEVEL[level];
    return list.some(item => v <= LEVEL[item.config.level]);
  };

  Logger.handler = function(name, level, message) {
    const item = list.find(o => o.test(name));
    const logger = item && winston.loggers.get(item.name);
    logger && logger[level](message, { name });
  };

  // restore
  return function() {
    Logger.prototype.isEnabled = isEnabled;
    Logger.handler = handler;
  };
};


function create(name, config) {
  const match = config.match;
  const test = !match ? () => true :
    typeof match === 'string' ? n => match === n :
      typeof match.test === 'function' ? n => match.test(n) :
        typeof match === 'function' ? match : () => true;

  const transports = [];
  const File = winston.transports.File;
  const Console = winston.transports.Console;
  const formatter = config.formatter || defaultFormatter;

  ensureFileDir(config.file);
  ensureFileDir(config.errorFile);

  config.file && transports.push(new File({
    name: name,
    filename: config.file,
    level: config.level,
    json: false,
    formatter
  }));

  config.errorFile && transports.push(new File({
    name: `${name}-error`,
    filename: config.errorFile,
    level: 'error',
    json: false,
    formatter
  }));

  config.consoleLevel && transports.push(new Console({
    name: `${name}-console`,
    level: config.consoleLevel,
    colorize: true,
    formatter
  }));

  winston.loggers.add(name, { transports });

  return { name, test, config };
}


function defaultFormatter(opts) {
  const now = new Date();
  const time = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() +
      ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
  return time + ' [' + opts.level.toUpperCase() + '] [' +
      opts.meta.name + '] ' + opts.message;
}


function ensureFileDir(path) {
  path && fse.ensureDirSync(pathUtil.dirname(path));
}
