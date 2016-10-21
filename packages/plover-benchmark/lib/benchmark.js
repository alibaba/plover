'use strict';


const noop = function() {};


class Benchmark {
  constructor() {
    this.cache = new Map();
    this.enabled = false;
  }

  mark(name, time) {
    if (!this.enabled) {
      return noop;
    }

    time = time || Date.now();
    const cache = this.cache;

    const item = {
      name: name,
      time: time,
      cost: -1    // unknow
    };

    cache.set(name, item);

    const done = end => {
      end = end || Date.now();
      item.cost = end - item.time;
    };

    return done;
  }


  report() {
    const items = Array.from(this.cache.values());
    items.sort((left, right) => {
      return left.time - right.time;
    });
    return items;
  }
}


module.exports = Benchmark;
