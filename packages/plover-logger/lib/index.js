const util = require('util');
const assert = require('assert');


const LOGGER = Symbol.for('plover-logger');


/* eslint no-console: 0, no-process-env: 0 */

/**
 * 保证Logger全局唯一，以正确有效地设置level和handler
 */

if (!global[LOGGER]) {
  global[LOGGER] = Logger;
}

module.exports = global[LOGGER];


// for test
module.exports.Logger = Logger;


function Logger(name) {
  if (!(this instanceof Logger)) {
    return new Logger(name);
  }

  assert(typeof name === 'string', 'logger name required');
  this.name = name;
}


const LEVEL = { error: 1, warn: 2, info: 3, debug: 4 };

Logger.level = process.env.DEBUG ? 'debug' : 'warn';

Object.keys(LEVEL).forEach(level => {
  Logger.prototype[level] = function() {
    if (LEVEL[level] <= LEVEL[Logger.level]) {
      const args = Array.from(arguments);
      const message = createMessage(args);
      Logger.handler(this.name, level, message);
    }
  };
});


Logger.prototype.isEnabled = function(level) {
  return LEVEL[level] <= LEVEL[Logger.level];
};


// 默认的Logger.handler使用debug模块实现，仅用于开发态
const debugCache = new Map();

Logger.handler = function(name, level, message) {
  let debug = debugCache.get(name);
  if (!debug) {
    debug = require('debug')(name);
    debugCache.set(name, debug);
  }

  message = '[' + level.toUpperCase() + '] ' + message;

  const msg = '  ' + name + ' ' + message + ' ';
  if (level === 'error') {
    console.error(red(msg));
  } else if (level === 'warn') {
    console.warn(yellow(msg));
  } else {
    debug(message);
  }
};


if (!process.env.DEBUG && process.env.NODE_ENV) {
  Logger.handler = function(name, level, message) {
    message = '[' + name + '] ' + message;
    const fn = console[level] || console.log;
    fn.call(console, message);
  };
}


function red(msg) {
  return util.format('\u001b[31m%s\u001b[39m', msg);
}

function yellow(msg) {
  return util.format('\u001b[33m%s\u001b[39m', msg);
}


function createMessage(args) {
  if (typeof args[0] !== 'string') {
    args = ['%o'].concat(args);
  }

  let msg = args[0];
  let index = 0;
  msg = msg.replace(/%([a-z%])/g, function(match, format) {
    index++;
    const formatter = exports.formatters[format];
    if (typeof formatter === 'function') {
      const val = args[index];
      match = formatter(val);
    }
    return match;
  });

  return msg;
}


exports.formatters = {
  s: function(val) {
    return '' + val;
  },

  o: function(val) {
    if (val instanceof Error) {
      let message = util.inspect(val);
      if (val.stack) {
        message += '\n' + val.stack;
      }
      return message;
    }
    return util.inspect(val);
  }
};
