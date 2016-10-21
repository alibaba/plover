# plover-benchmark


提供性能监控工具方法，记录模块渲染时间


## 接入

在应用中引入此插件

```
npm install --save plover-benchmark
```

1\. 默认情况下不会记录性能日志，可以通过以下配置开启 

```js
{
  benchmark: {
    enable: true
  }
}
```

2\. 启动时添加环境变量 `DEBUG_BENCHMARK=true` 也可以记录日志


```
$ DEBUG_BENCHMARK=true npm run start
```

## 使用

可以调用`benchmark` service提供的方法来记录调用时间

in middleware

```js
module.exports = function() {
  return function* () {
    ...
    const done = this.benchmark.mark('request-some-data');   // mark start
    yield requestSomeData();
    done();   // mark end
  };
}
```

开启`benchmark`后在控制台会得到类似以下输出:

```
                      plover-benchmark
------------------------------------------------------------
                       name                        cost(ms)
------------------------------------------------------------
request                                                196
cache-service                                           61
index:view.action                                       32
get view data                                            9
index:view.render                                       14
 index:item.action                                      11
unknow request                                      unknow
 index:item.render                                       0
 layouts:view.action                                    84
 layouts:view.render                                     0
```
