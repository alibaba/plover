<a name="2.3.0"></a>
# [2.3.0](https://github.com/alibaba/plover/compare/v2.2.1...v2.3.0) (2016-07-04)


### Performance Improvements

* improve performance for render children ([d1f20c2](https://github.com/alibaba/plover/commit/d1f20c2))
* 使用plover-util/lib/assign代替Object.assign提升性能 ([87c6b1b](https://github.com/alibaba/plover/commit/87c6b1b))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/alibaba/plover/compare/v2.1.1...v2.2.0) (2016-06-17)


### Bug Fixes

* 优化模块的加载，添加cache ([843511d](https://github.com/alibaba/plover/commit/843511d))



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
# 2.0.0 (2016-04-26)


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



