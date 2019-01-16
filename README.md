# cdn-assets-switch

## intro

switch all assets cdn domain(script,link,background-image,img).
切换所有静态资源文件的 cdn 域名。包括 script,link,background-image,img

when you open one website in a test domain you can switch cdn name to location.hostname or any domain
当你打开网站在一个测试域名，你可以将所有的 cdn 域名切换到当前域名或者任何域名

## when use

When you build front end assets in build tools like webpack. It will add cdn domain to assets.
当你使用像 webpack 这样的构建工具构建前端资源，cdn 域名将会写死到资源中去。

when you publish assets to test domain,It will load cdn-domain assets too(but cdn does not has assets). If you want to change cdn domain you can use this package.
当你发布了资源到测试域名所在的环境，他仍然会加载 cdn 的域名资源(但是此时 cdn 上没有该资源).如果你想切换 cdn 域名，你可以使用本模块。

I Recommend inline `index.js` to head. ！！！Only use in test environment.
推荐内联 index.js 到 head.注意！！！只建议在测试域名使用。

```javascript
// in test domain exec
if (is_in_test_domain && window.CdnAssetsSwitch) {
  var CdnAssetsSwitchObj = new CdnAssetsSwitch(function(url, type, sourceEl) {
    if (url && url.indexOf("static.baidu.com")) {
      return url.replace("static.baidu.com", location.hostname);
    }
  });
  // hack webpack to modify publicUrl this can be exec immediately. this must exec before async load like import()  or require.ensure
  CdnAssetsSwitchObj.hackWebpack();

  // replace when all assets load
  document.addEventListener("load", function() {
    CdnAssetsSwitchObj.reset();
  });
}
```

## documents

all function

```javascript

/**
 * @desc replaceFunc 
    1. return null undefined '' will not replace
    2. return new url string 
 *  @param url current url
    @param type replaceType script,image,backgroundImage,link,webpack
    @param sourceEl htmlNode or styleSheets.rules or __webpack_require__
 *  */
function replaceFunc(url, type, sourceEl){

}
new CdnAssetsSwitch(replaceFunc);

CdnAssetsSwitch.prototype = {
    reset // reset all assets
    // extend script and link attrs
    extendAttr,
    // replace asset url
    relaceScriptSrc,
    replaceLinkStyle,
    replaceBackGroundImage,
    relaceImgSrc,
    // hack webpack PublicUrl
    replaceWebpackPublicUrl, // plan one 
    hackWebpack // plan two
}
```
