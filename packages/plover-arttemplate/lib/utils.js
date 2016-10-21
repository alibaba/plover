'use strict';


const escape = require('escape-html');
const is = require('is-type-of');


module.exports = {
  $string: toString,
  $escape: escapeHtml,
  $output: output,
  $each: each,
  $range: range
};


function toString(value, ctx) {
  if (value === null || value === undefined) {
    return '';
  }

  const type = typeof value;
  if (type === 'string') {
    return value;
  }

  if (type === 'function') {
    return toString(value());
  }

  if (is.promise(value)) {
    return outputForPromise(value, ctx, false);
  }

  return String(value);
}


function escapeHtml(value, ctx) {
  if (value === null || value === undefined) {
    return '';
  }

  const type = typeof value;
  if (type === 'string') {
    return escape(value);
  }

  if (type === 'function') {
    return escapeHtml(value());
  }

  if (typeof value.toHTML === 'function') {
    return value.toHTML();
  }

  if (is.promise(value)) {
    return outputForPromise(value, ctx, true);
  }

  return escape(String(value));
}


function outputForPromise(value, ctx, flag) {
  const children = ctx.children || (ctx.children = []);
  children.push({ pos: ctx.get().length, value: value, escape: flag });
  return '';
}


function output(body, ctx) {
  const children = ctx && ctx.children;
  if (!children || children.length === 0) {
    return body;
  }

  const deps = children.map(child => child.value);
  return Promise.all(deps).then(results => {
    let result = '';
    let last = 0;
    for (let i = 0, c = children.length; i < c; i++) {
      const child = children[i];
      let text = results[i];
      text = child.escape ? escapeHtml(text) : toString(text);

      result += body.substring(last, child.pos);
      result += text;

      last = child.pos;
    }
    if (last < body.length) {
      result += body.substring(last);
    }
    return result;
  });
}


function each(data, fn) {
  if (!data) {
    return;
  }

  if (Array.isArray(data)) {
    for (let i = 0, len = data.length; i < len; i++) {
      fn(data[i], i, data);
    }
  } else {
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      fn(data[key], key, data);
    }
  }
}


function range(num, from, step) {
  const list = [];
  from = from || 0;
  step = step || 1;
  for (let i = 0; i < num; i++) {
    list.push(from);
    from += step;
  }
  return list;
}
