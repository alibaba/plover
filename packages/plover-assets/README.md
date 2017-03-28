# plover-assets


[![NPM version][npm-image]][npm-url]


【基础插件】提供前端资源相关的帮助方法和开发环境支持。

## Options
你能够通过配置信息定制化**plover-assets**模块。

```js
const app = plover({
  assets: {
    prefix: '/g'
  }
});
```

### concatItems
资源标签合并项。

e.g

**配置信息**

```js
assets: {
  concatItems: [{
    match: /^\/g\/(.*)$/, // 资源访问URL正则匹配
    prefix: '/g/??'  // 资源标签引用src前缀
  }]
}
```

**页面资源引用**

```html
{{assets.css('lib:css/tabs.css')}}
{{assets.css('css/mytabs.css')}}

{{assets.js('lib:js/tabs.js')}}
{{assets.js('js/mytabs.js')}}
```

**页面资源引用实际情况**

```html
<link rel="stylesheet" href="//127.0.0.1:10010/g/??lib/css/tabs.css,list/css/mytabs.css" />
<script src="//127.0.0.1:10010/g/??lib/js/tabs.js,list/js/mytabs.js"></script>
```

### enableConcat
是否开启资源标签合并功能，默认关闭，详见**concatItems**。

### enableMiddleware
是否启用**plover-assets**中间件模块，静态资源由plover应用处理（生产环境由cdn或nginx处理）。

### prefix
资源访问URL的前缀，默认为`/g`。

### publicRoot
公共资源路径，应用根路径的相对路径。

### simpleMode
是否为简单模式，默认为否，即采用异步方式引入资源。

### tagAttrs
定义资源标签属性。

e.g.

```js
assets: {
  tagAttrs: {
    js: {  // 资源类型
      default: {  // 资源所在组
        jsAttr: 'testJS'
      }
    },
    css: {
      default: {
        cssAttr: 'testCSS'
      }
    }
  }
}
```

**页面资源引用实际情况**

```html
<link rel="stylesheet" href="//localhost:10010/g/index/css/view.css" cssAttr="testCSS" />
<script src="//localhost:10010/g/index/js/view.js" jsAttr="testJS"></script>
```

### urlPattern
资源访问URL模式，默认为`prefix` + `'/{name}/{path}'`。


## assets Helper

### css
添加样式资源。

e.g.

```html
// assets.css(url, group)
{{assets.css('assets:bootstrap/dist/css/bootstrap.min.css', 'layout')}}
```

### js
添加脚本资源。

e.g.

```html
// assets.js(url, group)
{{assets.js('//astyle-src.alicdn.com/fdevlib/js/gallery/jquery/jquery-latest.js', 'default')}}
```

### url
返回资源访问URL。

e.g.

```html
// assets.url(moduleName:assetsPath)
<img src={{assets.url('img/combo.png')}} />  // 当前模块的assets目录中img/combo.png资源
<img src={{assets.url('lib:img/logo.png')}} />  // lib模块的assets目录中img/logo.png
```

**页面渲染结果**

```html
<img src="//127.0.0.1:10010/g/index/img/combo.png" />
<img src="//127.0.0.1:10010/g/lib/img/logo.png" />
```

### resolve
根据路由信息，返回当前路由资源访问URL。

### cssTag
创建样式标签。

e.g.

```html
// assets.cssTag(groups)
{{assets.cssTag()}}
```

**在当前位置创建样式标签**

```html
<link rel="stylesheet" href="//..." />
```

### jsTag
创建脚本标签。

e.g.

```html
// assets.jsTag(groups)
{{assets.jsTag()}}
```

**在当前位置创建脚本标签**

```html
<script src="//..."></script>
```

### transform
根据路由信息，返回当前路由资源对象。

**资源对象格式**

```js
{
  default: {
    css: [],
    js: []
  },
  layout: {
    css: [],
    js: []
  },
  ${groupName}: {
    css: [],
    js: []
  }
}
```

### root
返回当前模块资源访问根路径。

e.g.

```html
<img src="{{assets.root}}img/logo.png" />
```

**页面渲染结果**

```html
<img src=//127.0.0.1:10010/g/index/img/logo.png />
```


## ploverAssetsHandler
提供使用插件方式扩展资源的处理能力。

### add
添加资源处理器。

e.g.

```js
/**
 * 资源处理函数
 * @param path 资源文件路径
 * @param source 资源文件内容
 * @param info 当前模块信息
 * @param options 额外的可选项
 */
function* PloverAssetsHandlerLess(path, source, info, options) {
  // todo
}

/**
 * 添加资源处理器
 * @param type 资源类型，e.g. 'css'， 'js'。
 * @param ext 资源扩展名，e.g. `.less`。
 * @param handler 资源处理函数。
 * @param order 资源处理顺序，默认为`3`。
 */
app.ploverAssetsHandler.add('css', '.less', PloverAssetsHandlerLess, order);
```

**实例**

[plover-assets-less](https://github.com/ploverjs/plover-assets-less/blob/master/lib/plugin.js)

### filter
尝试找到path对应的文件并编译，用在请求一定的url上。

```js
/**
 * 
 * @param path 资源文件路径
 * @param info 当前模块信息
 * @param options 可选项
 */
app.ploverAssetsHandler.filter(path, info, options);
```

### compile
对指定文件进行编译。

```js
/**
 *
 * @param path 资源路径
 * @param info 当前模块信息
 * @param options 额外的信息
 */
app.ploverAssetsHandler.compile(path, info, options);
```



[npm-image]: https://img.shields.io/npm/v/plover-assets.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/plover-assets
