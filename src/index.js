export default class AssetsReload {
  constructor(replaceFunc) {
    this.replaceFunc = replaceFunc

    this.reloadCache = {
      SCRIPT: [],
      IMG: [],
      LINK: [],
      BACKGROUNDIMAGE: []
    }

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
    }
  }
  // reload all of one type assets enum: SCRIPT IMG LINK
  reloadAll(nodeName) {
    const domNodeList = document.getElementsByTagName(nodeName)
    const len = domNodeList.length;
    if (len === 0) {
      return false
    }
    for (let i = 0; i < len; i++) {
      this.reload(domNodeList[i]);
    }
  }
  /**
   *
   *  */
  reload(domElement) {
    const nodeName = domElement.nodeName;
    const {
      linkKey
    } = this.mapConf[nodeName];
    const link = domElement[linkKey]

    const newUrl = this.replaceFunc(link, nodeName, domElement)
    if (!newUrl) {
      return false
    }

    const newNode = document.createElement(nodeName)
    this.extendAttr(domElement, newNode)

    newNode[linkKey] = newUrl
    this.beforeInsertHook(nodeName, domElement, newNode);
    this.reloadCache[nodeName].push(link)
    domElement.parentNode.insertBefore(newNode, domElement)
    domElement.parentNode.removeChild(domElement)
  }
  /**
   * @desc replace backgroundImage
   *  */
  reloadBackgroundImage() {
    // detect is support styleSheets
    const isSupportStyleSheets = document.styleSheets && document.styleSheets[0]
    if (!isSupportStyleSheets) return false

    const styleSheetsLength = document.styleSheets.length
    for (let i = 0; i < styleSheetsLength; i++) {
      const styleSheets = document.styleSheets[i]
      try {
        if (!(styleSheets.rules && styleSheets.rules.length > 0)) {
          continue
        }
        for (let j = 0; j < styleSheets.rules.length; j++) {
          var item = styleSheets.rules[j]
          // is back null
          var backStr = item.selectorText && item.style && item.style.backgroundImage
          if (!backStr) {
            continue
          }
          // is has real url
          const matchRes = backStr.match(/url\(["|'](.*)["|']\)/)
          const backgroundImage = matchRes && matchRes[1]
          if (!backgroundImage) {
            continue
          }
          // base64 not replace
          if (backgroundImage.indexOf('data:image/') !== -1) {
            continue;
          }
          const nodeName = "BACKGROUNDIMAGE"
          const newUrl = this.replaceFunc(backgroundImage, nodeName, item)

          if (!newUrl) {
            continue
          }
          const cssText = item.selectorText + "{ background-image: url(" + newUrl + ")}"
          const cssTextKey = i + cssText
          if (this.reloadCache[nodeName].indexOf(cssTextKey) === -1) {
            this.beforeInsertHook(nodeName, backgroundImage, newUrl);
            this.reloadCache[nodeName].push(cssTextKey)
            // insertRule tail styleSheets

            styleSheets.insertRule(cssText, styleSheets.rules.length)
          }
        }
      } catch (err) {
        console.log("CdnAssetsSwitch replaceBackGroundImage", err)
      }
    }
  }
  /**
   * @desc inline after runtime code,can replace publicUrl
   *  */
  hackWebpack(callback, webpackModuelId = 'AssetsReloadMod') {
    // change webpack public path
    const webpackModFunc = (
      module,
      exports,
      webpackRequire
    ) => {
      callback && callback(webpackRequire)
    }
    // add to webpackJsonp array
    window["webpackJsonp"] = window["webpackJsonp"] || []
    window["webpackJsonp"].push([
      [webpackModuelId],
      {
        [webpackModuelId]: webpackModFunc
      },
      [
        [webpackModuelId]
      ]
    ])
  }
  /**
   * @desc entend origin node attributes
   *  */
  extendAttr(oldNode, newNode) {
    var attrMap = {
      'crossorigin': 'crossOrigin'
    }
    if (!(oldNode && oldNode.attributes)) {
      return
    }
    for (const key in oldNode.attributes) {
      if (oldNode.attributes.hasOwnProperty(key)) {
        const nodeAttr = oldNode.attributes[key]
        const name = attrMap[nodeAttr.name] || nodeAttr.name
        // extend function
        if (['onerror', 'onload', 'onabort'].indexOf(name) !== -1) {
          newNode[name] = oldNode[name]
        } else {
          newNode[nodeAttr.name] = nodeAttr.value
        }
      }
    }
  }
}
