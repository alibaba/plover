'use strict';


module.exports = function(app) {
  app.context.assertMethod = assertMethod;
};


/**
 * 验证Http Method
 *
 * @param {String|Array}  name  - 名称，如 get post put
 */
function assertMethod(name) {
  let valid = false;
  const method = this.method;

  if (typeof name === 'string') {
    valid = name.toUpperCase() === method;
  } else if (Array.isArray(name)) {
    valid = name.some(item => {
      return item.toUpperCase() === method;
    });
  }

  if (!valid) {
    this.throw(401, `invalid request method, expect: ${name}, actual: ${method}`);
  }
}

