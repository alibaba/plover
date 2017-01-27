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
 *  routes: [{ match, to, verb }, ...]
 *  middlewares: [{ match, middleware, options }, ...]
 * }
 */
module.exports = function(fn) {
  const routes = [];
  const middlewares = [];

  const states = [];
  const router = {};


  /*
   * get(match, to)
   * post(match, to)
   * ...
   */
  VERBS.forEach(verb => {
    router[verb] = function(match, to) {
      const item = {
        match: withStateMatch(states, match),
        to: withStateOptions(states, parseRule(to)),
        verb: verb
      };
      routes.push(item);
    };
  });


  /*
   * resouces(name, [options], [block])
   *
   * @param {Object} options
   * - only: {Array}
   */
  router.resources = function(name, options, block) {
    if (typeof options === 'function') {
      block = options;
      options = null;
    }
    options = Object.assign({}, options);

    const actions = options.only ||
        ['index', 'new', 'create', 'show', 'edit', 'update', 'delete'];
    delete options.only;

    const add = function(action, verb, match) {
      if (actions.indexOf(action) !== -1) {
        const to = { module: name, action: action };
        Object.assign(to, options);
        router[verb](match, to);
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


  /*
   * namespace(name, [options], block)
   */
  router.namespace = function(name, options, block) {
    if (typeof options === 'function') {
      block = options;
      options = null;
    }
    pushState(states, name, options);
    block();
    popState(states);
  };


  /*
   * use([match], middleware, options)
   */
  router.use = function(match, middleware, options) {
    if (typeof match === 'function') {
      options = middleware;
      middleware = match;
      match = null;
    }

    const item = {
      match: withStateMatch(states, match),
      middleware: middleware,
      options: options || {}
    };
    middlewares.push(item);
  };

  fn(router);
  assert(states.length === 0, 'states should empty');

  return { middlewares, routes };
};


const rRule = /^([^#:]+)[#:](.+)$/;
function parseRule(rule) {
  if (typeof rule === 'string') {
    const match = rRule.exec(rule);
    rule = { module: match[1], action: match[2] };
  }
  return rule;
}


function pushState(states, match, options) {
  const current = states[0] || {};
  match = join(current.match, match);
  options = Object.assign({}, current.options, options);
  states.unshift({ match: match, options: options });
}


function popState(states) {
  states.shift();
}


function withStateMatch(states, match) {
  const current = states[0] || {};
  return match ? join(current.match, match) : current.match;
}


function join(parent, name) {
  parent = parent || '';
  if (name.startsWith('/')) {
    return parent + name;
  }
  return parent + '/' + name;
}


function withStateOptions(states, options) {
  const current = states[0] || {};
  return Object.assign({}, current.options, options);
}
