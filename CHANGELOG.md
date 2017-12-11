<a name="4.3.1"></a>
## [4.3.1](https://github.com/alibaba/plover/compare/v4.3.0...v4.3.1) (2017-12-11)


### Bug Fixes

* 修复route使用/*的bug ([eb995d1](https://github.com/alibaba/plover/commit/eb995d1))



<a name="4.3.0"></a>
# [4.3.0](https://github.com/alibaba/plover/compare/v4.1.0...v4.3.0) (2017-12-11)


### Bug Fixes

* 修复layout和页面资源渲染顺序问题 ([5e121c8](https://github.com/alibaba/plover/commit/5e121c8))


### Features

* finish simple helper ([35612bf](https://github.com/alibaba/plover/commit/35612bf))
* 添加简单资源帮助方法 ([445eb92](https://github.com/alibaba/plover/commit/445eb92))



<a name="4.1.0"></a>
# [4.1.0](https://github.com/alibaba/plover/compare/v4.0.0...v4.1.0) (2017-06-29)


### Bug Fixes

* render with option layout=false to disable layout ([487ed10](https://github.com/alibaba/plover/commit/487ed10))


### Features

* parse http method from head `x-http-method-override` ([151f015](https://github.com/alibaba/plover/commit/151f015))
* resouces for singleton ([aad7265](https://github.com/alibaba/plover/commit/aad7265))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/alibaba/plover/compare/v2.11.0...v4.0.0) (2017-03-30)


### Features

* [plover-util] add lang.isPureFunction() ([8336fd0](https://github.com/alibaba/plover/commit/8336fd0))
* [plover-util] add lang#isAsyncFunction(obj) ([83093c9](https://github.com/alibaba/plover/commit/83093c9))
* [plover-xview] finish v3.0 ([6b7c8ed](https://github.com/alibaba/plover/commit/6b7c8ed))
* [plover] add app#use(middleware, [optioins]) ([ba90407](https://github.com/alibaba/plover/commit/ba90407))
* [plover] support async function ([8ae21a1](https://github.com/alibaba/plover/commit/8ae21a1))
* add util.isPureFunction() ([d11c4be](https://github.com/alibaba/plover/commit/d11c4be))
* upgrade koa to 2.0 ([78be25e](https://github.com/alibaba/plover/commit/78be25e))
* upgrade to koa@2 ([14f5ab6](https://github.com/alibaba/plover/commit/14f5ab6))
* upgrade to koa@2 ([58b5add](https://github.com/alibaba/plover/commit/58b5add))
* upgrade to koa@2 ([54c7248](https://github.com/alibaba/plover/commit/54c7248))
* v3.0 ([24deb1f](https://github.com/alibaba/plover/commit/24deb1f))
* 迁移plover-assets到主仓库，方便后续统一维护 ([5f68df3](https://github.com/alibaba/plover/commit/5f68df3))



<a name="2.11.0"></a>
# [2.11.0](https://github.com/alibaba/plover/compare/v2.10.0...v2.11.0) (2017-02-13)


### Bug Fixes

* 修复devDeps中的模块不能被加载的问题 ([b217358](https://github.com/alibaba/plover/commit/b217358))


### Features

* [plover-web] remove deps `koa-redius`. ([2e620a1](https://github.com/alibaba/plover/commit/2e620a1))
* filter支持路径过滤 ([ed6c9f9](https://github.com/alibaba/plover/commit/ed6c9f9))



<a name="2.10.0"></a>
# [2.10.0](https://github.com/alibaba/plover/compare/v2.9.0...v2.10.0) (2017-01-27)


### Bug Fixes

* [plover-router] routes not config npe. ([a424766](https://github.com/alibaba/plover/commit/a424766))
* [plover-web] fix add flash middleware error ([ff9d1eb](https://github.com/alibaba/plover/commit/ff9d1eb))
* addRoute missing options ([e5fb3d8](https://github.com/alibaba/plover/commit/e5fb3d8))


### Features

* [plover-web] add flash middleware ([4513ce7](https://github.com/alibaba/plover/commit/4513ce7))
* add koa-compress ([f65a2e2](https://github.com/alibaba/plover/commit/f65a2e2))
* add koa-static to packages plover-web. ([2871ee0](https://github.com/alibaba/plover/commit/2871ee0))
* plover-router namespace with options ([c657a88](https://github.com/alibaba/plover/commit/c657a88))
* render json with array data. ([d8199f8](https://github.com/alibaba/plover/commit/d8199f8))
* 通过POST传递参数_method实现put/patch等请求 ([d000046](https://github.com/alibaba/plover/commit/d000046))



<a name="2.9.0"></a>
# [2.9.0](https://github.com/alibaba/plover/compare/v2.8.4...v2.9.0) (2016-11-16)


### Features

* action和filter支持arrow function. ([bb0a023](https://github.com/alibaba/plover/commit/bb0a023))
* 可以通过配置设置默认布局。 ([2410873](https://github.com/alibaba/plover/commit/2410873))



<a name="2.8.4"></a>
## [2.8.4](https://github.com/alibaba/plover/compare/v2.8.3...v2.8.4) (2016-10-29)


### Features

* remote whitespace in production env for default. ([0aa34c9](https://github.com/alibaba/plover/commit/0aa34c9))


### Performance Improvements

* 优化include传递空对象数据时不需要产生state。 ([031f12e](https://github.com/alibaba/plover/commit/031f12e))



<a name="2.8.3"></a>
## [2.8.3](https://github.com/alibaba/plover/compare/v2.8.2...v2.8.3) (2016-10-15)


### Performance Improvements

* 优化control渲染 ([556882a](https://github.com/alibaba/plover/commit/556882a))



<a name="2.8.2"></a>
## [2.8.2](https://github.com/alibaba/plover/compare/v2.8.1...v2.8.2) (2016-10-10)


### Bug Fixes

* 修复加载其他模块control资源错误。 ([8d6a29e](https://github.com/alibaba/plover/commit/8d6a29e))



<a name="2.8.1"></a>
## [2.8.1](https://github.com/alibaba/plover/compare/v2.8.0...v2.8.1) (2016-10-06)


### Bug Fixes

* 修复proxy中间件名称没有设置 ([ede8b2f](https://github.com/alibaba/plover/commit/ede8b2f))



<a name="2.8.0"></a>
# [2.8.0](https://github.com/alibaba/plover/compare/v2.7.1...v2.8.0) (2016-10-06)


### Features

* addMiddleware支持method和match配置。 ([68d9f30](https://github.com/alibaba/plover/commit/68d9f30))



<a name="2.7.1"></a>
## [2.7.1](https://github.com/alibaba/plover/compare/v2.7.0...v2.7.1) (2016-10-06)



<a name="2.7.0"></a>
# [2.7.0](https://github.com/alibaba/plover/compare/v2.6.1...v2.7.0) (2016-10-01)


### Bug Fixes

* include async ([65c9ee1](https://github.com/alibaba/plover/commit/65c9ee1))


### Features

* 完成app.control的性能优化 ([0a36320](https://github.com/alibaba/plover/commit/0a36320))


### Performance Improvements

* 优化filters的初始化 ([15dba47](https://github.com/alibaba/plover/commit/15dba47))



<a name="2.6.1"></a>
## [2.6.1](https://github.com/alibaba/plover/compare/v2.6.0...v2.6.1) (2016-09-19)


### Bug Fixes

* 修复加载子模块前端资源的问题 ([a8de526](https://github.com/alibaba/plover/commit/a8de526))



<a name="2.6.0"></a>
# [2.6.0](https://github.com/alibaba/plover/compare/v2.5.1...v2.6.0) (2016-09-11)


### Features

* improve route ([e342729](https://github.com/alibaba/plover/commit/e342729))
* route添加method检测 ([8166bbe](https://github.com/alibaba/plover/commit/8166bbe))



<a name="2.5.1"></a>
## [2.5.1](https://github.com/alibaba/plover/compare/v2.5.0...v2.5.1) (2016-09-10)


### Bug Fixes

* 修复升级path-to-regexp到1.3及以上版本原有规则不能正常使用 [#22](https://github.com/alibaba/plover/issues/22) ([35a2b51](https://github.com/alibaba/plover/commit/35a2b51))



<a name="2.5.0"></a>
# [2.5.0](https://github.com/alibaba/plover/compare/v2.3.0...v2.5.0) (2016-07-11)


### Performance Improvements

* 对异步渲染引擎的支持 ([12594be](https://github.com/alibaba/plover/commit/12594be))



<a name="2.3.0"></a>
# [2.3.0](https://github.com/alibaba/plover/compare/v2.2.1...v2.3.0) (2016-07-04)


### Performance Improvements

* improve performance for render children ([d1f20c2](https://github.com/alibaba/plover/commit/d1f20c2))
* 使用plover-util/lib/assign代替Object.assign提升性能 ([87c6b1b](https://github.com/alibaba/plover/commit/87c6b1b))



<a name="2.2.1"></a>
## [2.2.1](https://github.com/alibaba/plover/compare/v2.2.0...v2.2.1) (2016-06-20)



<a name="2.2.0"></a>
# [2.2.0](https://github.com/alibaba/plover/compare/v2.1.1...v2.2.0) (2016-06-17)


### Bug Fixes

* 优化模块的加载，添加cache ([843511d](https://github.com/alibaba/plover/commit/843511d))



<a name="2.1.1"></a>
## [2.1.1](https://github.com/alibaba/plover/compare/v2.1.0...v2.1.1) (2016-05-09)



<a name="2.1.0"></a>
# [2.1.0](https://github.com/alibaba/plover/compare/v2.0.3...v2.1.0) (2016-05-08)


### Features

* app.listen support hostname param ([4ab57e0](https://github.com/alibaba/plover/commit/4ab57e0))



<a name="2.0.3"></a>
## [2.0.3](https://github.com/alibaba/plover/compare/v2.0.2...v2.0.3) (2016-05-05)


### Bug Fixes

* 修复加载控制器失败时，未打印出具体控制器文件地址信息的问题 ([95f217d](https://github.com/alibaba/plover/commit/95f217d))



<a name="2.0.2"></a>
## [2.0.2](https://github.com/alibaba/plover/compare/v2.0.1...v2.0.2) (2016-05-03)


### Features

* add moduleResolver to koa app ([2dbc979](https://github.com/alibaba/plover/commit/2dbc979))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/alibaba/plover/compare/v2.0.0...v2.0.1) (2016-04-26)


### Features

* 恢复helper.$扩展helper的方式 ([515420b](https://github.com/alibaba/plover/commit/515420b))
* 重构helpers，不再支持helper $ ([0816fb7](https://github.com/alibaba/plover/commit/0816fb7))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/alibaba/plover/compare/8bf94aa...v2.0.0) (2016-04-26)


### Bug Fixes

* add startup component sto default components set ([744f469](https://github.com/alibaba/plover/commit/744f469))


### Features

* 中间件上下文可以取得moduleResolver ([964e6a0](https://github.com/alibaba/plover/commit/964e6a0))
* **components:** add router component ([406ebc0](https://github.com/alibaba/plover/commit/406ebc0))
* 初始化仓库，迁移util工具模块 ([8bf94aa](https://github.com/alibaba/plover/commit/8bf94aa))
* 完成基础功能和组织形式 ([0421cfa](https://github.com/alibaba/plover/commit/0421cfa))
* 将config放到中间件上下文 ([805435d](https://github.com/alibaba/plover/commit/805435d))
* **components:** add service component ([8c6b8eb](https://github.com/alibaba/plover/commit/8c6b8eb))
* 提供$proto方式扩展helper，去掉原来的$方式，性能可以更好 ([6b78669](https://github.com/alibaba/plover/commit/6b78669))
* **components:** add core component ([6d3f89b](https://github.com/alibaba/plover/commit/6d3f89b))
* **components:** add navigate component ([62be1ee](https://github.com/alibaba/plover/commit/62be1ee))
* **components:** add plugin component ([ab7e567](https://github.com/alibaba/plover/commit/ab7e567))
* **components:** add startup component ([443b6a6](https://github.com/alibaba/plover/commit/443b6a6))
* **core:** add action-runner ([55bffce](https://github.com/alibaba/plover/commit/55bffce))
* **core:** add ActionContext ([686f6a9](https://github.com/alibaba/plover/commit/686f6a9))
* **core:** add helper-container ([e6e28f9](https://github.com/alibaba/plover/commit/e6e28f9))
* **core:** add navigator ([1a10b84](https://github.com/alibaba/plover/commit/1a10b84))
* **core:** add render-helper ([6c63bec](https://github.com/alibaba/plover/commit/6c63bec))
* **core:** add view-render ([86d241c](https://github.com/alibaba/plover/commit/86d241c))
* **helper:** add app helper ([f37f6ef](https://github.com/alibaba/plover/commit/f37f6ef))
* **util:** add invoker ([5fa6ef2](https://github.com/alibaba/plover/commit/5fa6ef2))
* **util:** add route-cache ([c5d9c54](https://github.com/alibaba/plover/commit/c5d9c54))
* **util:** add router ([a28a75e](https://github.com/alibaba/plover/commit/a28a75e))
* **util:** add util/config module ([92ba0a5](https://github.com/alibaba/plover/commit/92ba0a5))
* **util:** add util/error-handler ([2e70f0e](https://github.com/alibaba/plover/commit/2e70f0e))


### Performance Improvements

* 优化view-render构造render-context流程 ([7df049f](https://github.com/alibaba/plover/commit/7df049f))



