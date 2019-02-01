# assets-reload

## intro

前端资源重载，大流量的网站，就得考虑资源加载失败的情况下，用户白屏等问题。

因此必须对资源进行重载, 本模块通过 `script, link, img`等标签上的 `onerror`回调来进行资源加载重试，并且规则可定制。

并且针对背景图也提供了替换方案。

## when use

```javascript
try {
  var isInTestDomain = location.hostname.indexOf("www.qq.com") > 0;
  // 资源重载自定义规则函数
  var cdnHostname = "www-img.tenpay.com";
  function assetsReloadFunc(url, type, sourceEl) {
    // 线上静态资源都请求cdn 只对cdn资源进行重试
    var isCdn = url && url.indexOf(cdnHostname) != -1;
    if (!isCdn) {
      return false;
    }

    var reloadTimes = 0;
    var urlSearch = url.split("?")[1];

    // 查看重试了几次
    if (urlSearch) {
      var matchRes = urlSearch.match(/reloadAssets=(\d+)&?/);
      if (matchRes && matchRes.length > 1) {
        reloadTimes = Number(matchRes[1]);
      }
    }
    // 非测试环境 第一次重试cdn域名资源
    var replaceUrl;
    if (isInTestDomain && reloadTimes == 0) {
      replaceUrl =
        url.replace(cdnHostname, location.hostname) +
        (urlSearch ? "&" : "?") +
        "reloadAssets=1";
      return replaceUrl;
    }
    if (!isInTestDomain) {
      if (reloadTimes == 0) {
        return url + (urlSearch ? "&" : "?") + "reloadAssets=1";
      } else if (reloadTimes <= 1) {
        // 此处阈值可以调整
        replaceUrl = url.replace(cdnHostname, location.hostname);
        return replaceUrl.replace(
          "reloadAssets=" + reloadTimes,
          "reloadAssets=" + (1 + reloadTimes)
        );
      }
    }
  }
  var assetsReloadItem = new AssetsReload(assetsReloadFunc);
  if (isInTestDomain) {
    assetsReloadItem.hackWebpack(function(webpackRequire){
      // 替换webpack的静态资源 publicPath
      webpackRequire.p = webpackRequire.p.replace(cdnHostname, location.hostname);
    });
    // 如果标签上都没有绑定  onerror 则可以直接进行全量替换重试，不过建议 写上 onerror 而非全量替换
    assetsReloadItem.reloadAll("SCRIPT");
    assetsReloadItem.reloadAll("LINK");
    assetsReloadItem.reloadAll("IMG");
    setTimeout(function(){
      // 替换背景图
      assetsReloadItem.reloadBackgroundImage();
    },800)

  }
  // 全局绑定 attackCatch 函数
  // 在 <script src="test.js" onerror="attackCatch(this)">
  window.attackCatch = function(htmlNode) {
    assetsReloadItem.reload(htmlNode);
  };
} catch (err) {
  console.error(err);
}
```
