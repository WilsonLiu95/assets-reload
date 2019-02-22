/*!
  * assets-reload v1.1.0
  * (c) 2019 wilsonliuxyz@gmail.com
  * @description switch all assets cdn name (script,link,background-image,img). when you open one website in a test domain you can switch cdn name to location.hostname
  * @license MIT
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.AssetsReload = factory());
}(this, (function () { 'use strict';

var AssetsReload = function AssetsReload(replaceFunc, beforeInsertHook) {
  this.replaceFunc = replaceFunc;
  this.beforeInsertHook = beforeInsertHook || (function () {});
  this.reloadCache = {
    SCRIPT: [],
    IMG: [],
    LINK: [],
    BACKGROUNDIMAGE: []
  };

  this.mapConf = {
    SCRIPT: {
      linkKey: 'src',
    },
    IMG: {
      linkKey: 'src',
    },
    LINK: {
      linkKey: 'href',
    }
  };
};
// reload all of one type assets enum: SCRIPT IMG LINK
AssetsReload.prototype.reloadAll = function reloadAll (nodeName) {
  var domNodeList = document.getElementsByTagName(nodeName);
  var len = domNodeList.length;
  if (len === 0) {
    return false
  }
  for (var i = 0; i < len; i++) {
    this.reload(domNodeList[i]);
  }
};
/**
 *
 **/
AssetsReload.prototype.reload = function reload (domElement) {
  var nodeName = domElement.nodeName;
  var ref = this.mapConf[nodeName];
    var linkKey = ref.linkKey;
  var link = domElement[linkKey];

  var newUrl = this.replaceFunc(link, domElement);
  if (!newUrl) {
    return false
  }

  var newNode = document.createElement(nodeName);
  this.extendAttr(domElement, newNode);

  newNode[linkKey] = newUrl;
  this.beforeInsertHook(nodeName, domElement, newNode);
  this.reloadCache[nodeName].push(link);
  domElement.parentNode.insertBefore(newNode, domElement);
  domElement.parentNode.removeChild(domElement);
};
/**
 * @desc replace backgroundImage
 **/
AssetsReload.prototype.reloadBackgroundImage = function reloadBackgroundImage () {
  // detect is support styleSheets
  var isSupportStyleSheets = document.styleSheets && document.styleSheets[0];
  if (!isSupportStyleSheets) { return false }

  var styleSheetsLength = document.styleSheets.length;
  for (var i = 0; i < styleSheetsLength; i++) {
    var styleSheets = document.styleSheets[i];
    try {
      if (!(styleSheets.rules && styleSheets.rules.length > 0)) {
        continue
      }
      for (var j = 0; j < styleSheets.rules.length; j++) {
        var item = styleSheets.rules[j];
        // is back null
        var backStr = item.selectorText && item.style && item.style.backgroundImage;
        if (!backStr) {
          continue
        }
        // is has real url
        var matchRes = backStr.match(/url\(["|'](.*)["|']\)/);
        var backgroundImage = matchRes && matchRes[1];
        if (!backgroundImage) {
          continue
        }
        // base64 not replace
        if (backgroundImage.indexOf('data:image/') !== -1) {
          continue;
        }
        var nodeName = "BACKGROUNDIMAGE";
        var newUrl = this.replaceFunc(backgroundImage, item);

        if (!newUrl) {
          continue
        }
        var cssText = item.selectorText + "{ background-image: url(" + newUrl + ")}";
        var cssTextKey = i + cssText;
        if (this.reloadCache[nodeName].indexOf(cssTextKey) === -1) {
          this.beforeInsertHook(nodeName, backgroundImage, newUrl);
          this.reloadCache[nodeName].push(cssTextKey);
          // insertRule tail styleSheets

          styleSheets.insertRule(cssText, styleSheets.rules.length);
        }
      }
    } catch (err) {
      console.log("CdnAssetsSwitch replaceBackGroundImage", err);
    }
  }
};
/**
 * @desc entend origin node attributes
 **/
AssetsReload.prototype.extendAttr = function extendAttr (oldNode, newNode) {
  var attrMap = {
    'crossorigin': 'crossOrigin'
  };
  if (!(oldNode && oldNode.attributes)) {
    return
  }
  for (var key in oldNode.attributes) {
    if (oldNode.attributes.hasOwnProperty(key)) {
      var nodeAttr = oldNode.attributes[key];
      var name = attrMap[nodeAttr.name] || nodeAttr.name;
      // extend function
      if (['onerror', 'onload', 'onabort'].indexOf(name) !== -1) {
        newNode[name] = oldNode[name];
      } else {
        newNode[nodeAttr.name] = nodeAttr.value;
      }
    }
  }
};

return AssetsReload;

})));
