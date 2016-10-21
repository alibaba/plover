'use strict';


const assert = require('assert');
const inflection = require('inflection');


const VERBS = [
  'get',
  'post',
  'put',
  'patch',
  'delete'
];


/**
 * 使用restful api定义路由规则和中间件
 *
 * @param {Function} fn  - 定义
 * @return {Object}      - 描述路由和中间件的数据结构
 * {
 *  routes: [...]
 *  middlewares: [...]
 * }
 */
module.exports = function(fn) {
  const routes = [];
  const middlewares = [];

  const states = [];

  const router = {};

  VERBS.forEach(verb => {
    router[verb] = function(match, to) {
      const item = {
        match: withState(states, match),
        to: to,
        verb: verb
      };
      routes.push(item);
    };
  });

  router.resources = function(name, options, block) {
    if (typeof options === 'function') {
      block = options;
      options = null;
    }
    options = options || {};

    const actions = options.only ||
        ['index', 'new', 'create', 'show', 'edit', 'update', 'delete'];

    const add = function(action, verb, match) {
      if (actions.indexOf(action) !== -1) {
        router[verb](match, { module: name, action: action });
      }
    };

    add('index', 'get', `/${name}`);
    add('new', 'get', `/${name}/new`);
    add('create', 'post', `/${name}`);
    add('show', 'get', `/${name}/:id`);
    add('edit', 'get', `/${name}/:id/edit`);
    add('update', 'put', `/${name}/:id`);
    add('update', 'patch', `/${name}/:id`);
    add('delete', 'delete', `/${name}/:id`);

    if (block) {
      const sname = inflection.singularize(name);
      pushState(states, `${name}/:${sname}_id`);
      block();
      popState(states);
    }
  };

  router.namespace = function(name, block) {
    pushState(states, name);
    block();
    popState(states);
  };

  router.use = function(match, middleware, options) {
    if (typeof match === 'function') {
      options = middleware;
      middleware = match;
      match = null;
    }

    const item = {
      match: withState(states, match),
      middleware: middleware,
      options: options || {}
    };
    middlewares.push(item);
  };

  fn(router);
  assert(states.length === 0, 'states should empty');

  return { middlewares, routes };
};


function pushState(states, value) {
  const state = join(states[0], value);
  states.unshift(state);
}


function popState(states) {
  states.shift();
}


function withState(states, match) {
  const current = states[0];
  return match ? join(current, match) : current;
}


function join(parent, name) {
  parent = parent || '';
  if (name.startsWith('/')) {
    return parent + name;
  }
  return parent + '/' + name;
}
