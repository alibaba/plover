'use strict';


const fmt = require('output-formatter');

const logger = require('plover-logger')('plover-benchmark');


/* eslint no-process-env: 0, no-console: 0 */


module.exports = function(app) {
  app.addService('benchmark', require('./benchmark'));

  const config = app.settings.benchmark || {};
  if (config.enable || process.env.DEBUG_BENCHMARK) {
    logger.info('benchmark is enable');

    app.addFilter(require('./filter'));

    app.addMiddleware(function* PloverBenchmark(next) {
      this.benchmark.enabled = true;
      const done = this.benchmark.mark('request');
      yield* next;
      done();

      const items = this.benchmark.report();
      if (items.length > 1) {
        log(this.url, items);
      }
    }, { level: 0 });
  }
};


function log(url, items) {
  let output = fmt.center('plover-benchmark', 60) + '\n';
  output += fmt.line('-', 60) + '\n';
  output += fmt.center('name', 50) +
      fmt.center('cost(ms)', 10) + '\n';
  output += fmt.line('-', 60) + '\n';

  for (const item of items) {
    const cost = item.cost === -1 ? 'unknow' : item.cost;
    output += fmt.left(item.name, 50) +
        fmt.right(cost, 8) + '\n';
  }

  logger.info(output);
  if (process.env.DEBUG_BENCHMARK) {
    console.log(output);
  }
}
