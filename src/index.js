/**
 * @desc reset cdn domain name
 *  */
function CdnAssetsSwitch(replaceFunc) {
  this.replaceFunc = replaceFunc
  this.switchCache = {
    SCRIPT: [],
    IMAGE: [],
    LINK: [],
    BACKGROUNDIMAGE: []
  }
}

CdnAssetsSwitch.prototype = {
  reset,
  extendAttr,
  relaceScriptSrc,
  replaceLinkStyle,
  replaceOneScript,
  replaceOneLink,
  replaceBackGroundImage,
  relaceImgSrc,
  replaceWebpackPublicUrl,
  hackWebpack
}
/**
 * @desc reset all assets
 *  */
function reset() {
  try {
    this.relaceScriptSrc()
    this.replaceLinkStyle()
    this.replaceBackGroundImage()
    this.relaceImgSrc()
    this.hackWebpack()
  } catch (err) {
    console.error(err)
  }
}
/**
 * @desc relace cdn script to new domain
 *
 *  */
function relaceScriptSrc() {
  var scripts = document.querySelectorAll("script")
  if (scripts.length === 0) {
    return false
  }
  for (var i = 0; i < scripts.length; i++) {
    var scriptEl = scripts[i]
    this.replaceOneScript(scriptEl)
  }
}
/**
 * @desc relace one cdn script to new domain
 *
 *  */
function replaceOneScript(scriptEl) {
  var scriptsSrc = scriptEl.src
  var newUrl = this.replaceFunc(scriptsSrc, "script", scriptEl)
  if (newUrl) {
    var node = document.createElement("script")
    this.extendAttr(scriptEl, node)
    node.src = newUrl

    scriptEl.parentNode.insertBefore(node, scriptEl)
    scriptEl.parentNode.removeChild(scriptEl)
  }
}
/**
 * @desc entend origin node attributes
 *  */
/**
 * @desc entend origin node attributes
 *  */
function extendAttr(oldNode, newNode) {
  var attrs = {}
  var attrMap = {
    'crossorigin': 'crossOrigin'
  }
  for (const key in oldNode.attributes) {
    if (oldNode.attributes.hasOwnProperty(key)) {
      const nodeAttr = oldNode.attributes[key]
      var name = attrMap[nodeAttr.name] || nodeAttr.name
      attrs[name] = nodeAttr.value
      // extend function
      if (['onerror', 'onload', 'onabort'].indexOf(name) !== -1) {
        newNode[name] = oldNode[name]
      } else {
        newNode[nodeAttr.name] = nodeAttr.value
      }
    }
  }
  this.switchCache[oldNode.nodeName].push(attrs)
  return attrs
}
/**
 * @desc replace link href
 *  */
function replaceLinkStyle() {
  // 替换link标签
  var links = document.querySelectorAll("link")
  if (links.length == 0) {
    return false
  }
  for (var i = 0; i < links.length; i++) {
    var linkEl = links[i]
    var that = this
    this.replaceOneLink(linkEl, function () {
      that.replaceBackGroundImage()
    })
  }
}
/**
 * @desc replace one link href
 *  */
function replaceOneLink(linkEl, onloadFunc) {
  var newUrl = this.replaceFunc(linkEl.href, "link", linkEl)
  if (newUrl) {
    var node = document.createElement("link")
    this.extendAttr(linkEl, node)

    node.href = newUrl
    if (onloadFunc) {
      if (node.onload) {
        node.onload = function () {
          onloadFunc()
          node.onload(arguments)
        }
      } else {
        node.onload = onloadFunc
      }
    }

    linkEl.parentNode.insertBefore(node, linkEl)
    linkEl.parentNode.removeChild(linkEl)
  }
}
/**
 * @desc replace img src
 *  */
function relaceImgSrc() {
  var imgs = document.querySelectorAll("img")
  for (var i = 0; i < imgs.length; i++) {
    var imgEl = imgs[i]
    var newUrl = this.replaceFunc(imgEl.src, "imgage", imgEl)
    if (newUrl) {
      this.switchCache["IMAGE"].push(imgEl.src)
      imgEl.src = newUrl
    }
  }
}
/**
 * @desc replace backgroundImage
 *  */
function replaceBackGroundImage() {
  // detect is support styleSheets
  var isSupportStyleSheets = document.styleSheets && document.styleSheets[0]
  if (!isSupportStyleSheets) return false

  var styleSheetsLength = document.styleSheets.length
  for (var i = 0; i < styleSheetsLength; i++) {
    var styleSheets = document.styleSheets[i]
    // chrome64 version forbid cors access css rules
    try {
      if (!(styleSheets.rules && styleSheets.rules.length > 0)) {
        continue
      }
      for (var j = 0; j < styleSheets.rules.length; j++) {
        var item = styleSheets.rules[j]
        var backgroundImage =
          item.selectorText && item.style && item.style.backgroundImage
        if (!backgroundImage) {
          continue
        }
        var newUrl = this.replaceFunc(backgroundImage, "backgroundImage", item)
        if (!newUrl) {
          continue
        }
        var cssText = item.selectorText + "{ background-image:" + newUrl + "}"
        var cssTextKey = i + cssText
        if (this.switchCache["BACKGROUNDIMAGE"].indexOf(cssTextKey) != -1) {
          this.switchCache["BACKGROUNDIMAGE"].push(cssTextKey)
          // insertRule tail styleSheets
          styleSheets.insertRule(cssText, styleSheets.rules.length)
        }
      }
    } catch (err) {
      // console.log("CdnAssetsSwitch replaceBackGroundImage", err)
    }
  }
}
// plan1: inline after runtime code,can replace publicUrl
function hackWebpack(webpackModuelId) {
  var that = this
  webpackModuelId = webpackModuelId || "cdnAssetsSwitchWebpack"

  var chunkIds = [webpackModuelId]
  var moreModules = {}
  moreModules[webpackModuelId] = function (
    module,
    exports,
    webpackRequire
  ) {
    if (webpackRequire) {
      window.__webpack_require__ = webpackRequire
      var newUrl = that.replaceFunc(
        webpackRequire.p,
        "webpack",
        webpackRequire
      )
      if (newUrl) {
        webpackRequire.p = newUrl
      }
    }
  }
  var executeModules = [
    [webpackModuelId]
  ]

  (window["webpackJsonp"] = window["webpackJsonp"] || []).push([
    chunkIds,
    moreModules,
    executeModules
  ])
}
module.exports = CdnAssetsSwitch
