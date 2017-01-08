# plover-web


[![NPM version][npm-image]][npm-url]


【插件】集成常用koa中间件，提供通用web功能。

包括：

- 集成常用koa中间件
- session中间件
- query/params API增强
- csrftoken校验
- 输出http安全头


## 集成常用koa中间件

koa提供了 [很多中间件](https://github.com/koajs/koa/wiki) 来满足各种各样的需求，这里集成了经常用到的一些中间件。  

包括：

- [koa-favicon](https://github.com/koajs/favicon)
- [koa-response-time](https://github.com/koajs/response-time)
- [koa-conditional-get](https://github.com/koajs/conditional-get)
- [koa-etag](https://github.com/koajs/etag)
- [koa-bodyparser](https://github.com/koajs/bodyparser)
- [koa-static](https://github.com/koajs/static)

可通过配置 `config/app.js` 来开启和关闭这些中间件。配置示例如下：


```js
module.exports = {
  web: {
    favicon: pathUtil.join(__dirname, '../public/favicon.ico'),

    // cache相关，注释掉会关闭此中间件
    rtime: {},
    conditional: {},
    etag: { enable: false },

    // 默认开启的，具体参数可参考:
    // https://github.com/koajs/bodyparser
    bodyParser: {
      formLimit: '1mb',
      jsonLimit: '1mb'
    },

    static: {
      root: pathUtil.join(__dirname, '../public')
    }
  }
}
```

## session

框架默认集成了[cookie session](https://github.com/koajs/session)和[redis sessioin](https://github.com/koajs/koa-redis)用以满足一般场景下的session需求。如果什么都不配置，默认开启`cookie-session`。

使用session必须先配置`keys`。


```js
{
  web: {
    keys: ['17e6b6bc6129097383dcad4fa1602233'], // <- 可使用工具如(`uuidgen`)重新生成一个。
  }
}
```

如需使用redis作为session store，可作如下配置。

```js
{
  web: {
    session: {
      store: 'redis',
      // 额外的配置，可参考：
      // https://github.com/koajs/koa-redis#options
      storeOpts: {
      }
    }
  }
}
```

## query增强


### this.params


类似于[express](http://expressjs.com/)，提供`this.params`用于同时取得url和post提交中的参数。


```js
module.exports = function* () {
  const page = this.params.page;
  // 相当于 this.query.page || this.request.body.page;
};
```


### query的优化和增强

默认情况下`this.query`会将同名参数解析成数组，如

```js
// GET /path?a=1&a=2
this.query
-> { a: ['1', '2'] }
```

这在实际使用中很容易出现问题，比如不小心多加个同名参数，页面很可能就500了，所以框架优化了此特性。  
针对以上场景总是会返回最后一个参数值。

```js
// GET /path?a=1&a=2
this.query
-> { a: '2' }
```

如果需要复杂的参数，需要明确使用以下形式：

```js
// GET /path?a[]=1&a[]=2
this.query
-> { a: ['1', '2'] }
```

更复杂的嵌套类型也是支持的，具体的序列化细节可参考[qs](https://github.com/koajs/qs)，这样就和POST请求时参数的解析保持一致了，因为后者就是使用`qs`库来解析的。


## csrftoken

框架集成了[koa-csrf](https://github.com/koajs/csrf)。默认情况下，对`POST/PUT/DELETE`等更新类请求会要求验证csrftoken; 即提交域中必须包含正确的`_csrf`字段才能正确访问页面。

特殊情况时，可通过配置来忽略或强制csrftoken的校验。

```js
{
  web: {
    csrf: {
      // 忽略csrftoken校验
      // 路径规则见：https://github.com/pillarjs/path-to-regexp
      ignore: [
        '/api/*'
      ],

      // 以下请求即使是get请求也要校验csrf token
      match: [
        '/update.jsonp'
      ]
    }
  }
}
```

如果配置还不满足需求时，可以在中间件或控制器中调用api来校验csrftoken。

```js
module.exports = function() {
  return functioin* (next) {
    if (this.path === '/some-special-case') {
      this.assertCsrf();    // 校验csrftoken
    }
  };
};
```


## http安全头

默认对页面添加以下HTTP安全头

```
X-XSS-Protection:       1; mode=block
X-Content-Type-Options: nosniff
X-Download-Options:     noopen
X-Frame-Options:        SAMEORIGIN
```

可通过配置关闭

```js
{
  security: {
    headers: {
      'X-Frame-Options': false
    }
  }
}
```

## 扩展KoaContext

### assertMethod(name)

断言以指定http method访问页面，否则抛出401异常，禁止页面访问。

### 中间件示例

```js
module.exports = function() {
  return function* (next) {
    if (this.path === '/save') {
      this.assertMethod('post');   // 只允许post访问
      ...
    }
  };
}
```

#### 控制器示例

```js
exports.index = function() {
  this.ctx.assertMethod(['get', 'post'])  // 只允许get/post访问
}
```

[npm-image]: https://img.shields.io/npm/v/plover-web.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/plover-web
