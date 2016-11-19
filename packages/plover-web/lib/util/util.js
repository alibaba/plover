'use strict';


const pathToRegexp = require('path-to-regexp');


exports.regularRules = function(rules) {
  rules = rules || [];
  rules = Array.isArray(rules) ? rules : [rules];
  return rules.map(rule => {
    if (typeof rule === 'string') {
      rule = pathToRegexp(rule);
    }
    return rule;
  });
};


exports.testRules = function(rules, path) {
  return rules.length && rules.some(rule => rule.test(path));
};


exports.CSRF_CHECKED = Symbol('CSRF_CHECKED');
