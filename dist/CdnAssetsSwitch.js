(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["CdnAssetsSwitch"] = factory();
	else
		root["CdnAssetsSwitch"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/** 
 * CdnAssetsSwitch v1.0.0 (https://github.com/WilsonLiu95/cdn-assets-switch)
 */
/**
 * @desc reset cdn domain name
 *  */
function CdnAssetsSwitch(replaceFunc) {
    this.replaceFunc = replaceFunc;
    this.switchCache = {
        'SCRIPT': [],
        'IMAGE': [],
        'LINK': [],
        "BACKGROUNDIMAGE": []
    };
}

CdnAssetsSwitch.prototype = {
    reset,
    extendAttr,
    relaceScriptSrc,
    replaceLinkStyle,
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
        this.replaceBackGroundImage();
        this.relaceImgSrc();
        this.hackWebpack()
    } catch (err) {
        console.error(err);
    }
}
/**
 * @desc relace cdn script to new domain
 * 
 *  */
function relaceScriptSrc() {
    var scripts = document.querySelectorAll('script');
    if (scripts.length == 0) {
        return false;
    }
    for (var i = 0; i < scripts.length; i++) {
        var scriptsEl = scripts[i];
        var scriptsSrc = scriptsEl.src;
        var newUrl = this.replaceFunc(scriptsSrc, 'script', scriptsEl);
        if (newUrl) {
            var node = document.createElement('script');
            this.extendAttr(scriptsEl, node);

            node.src = newUrl;

            scriptsEl.parentNode.insertBefore(node, scriptsEl);
            scriptsEl.parentNode.removeChild(scriptsEl);
        }
    }
}
/**
 * @desc entend origin node attributes
 *  */
function extendAttr(oldNode, newNode) {
    var attrs = {};

    for (const key in oldNode.attributes) {
        if (oldNode.attributes.hasOwnProperty(key)) {
            const nodeAttr = oldNode.attributes[key];
            attrs[nodeAttr.name] = nodeAttr.value;
            newNode[nodeAttr.name] = nodeAttr.value;
        }
    }
    this.switchCache[oldNode.nodeName].push(attrs);
    return attrs;
}
/**
 * @desc replace link href
 *  */
function replaceLinkStyle() {
    // 替换link标签
    var links = document.querySelectorAll('link');
    if (links.length == 0) {
        return false;
    }
    for (var i = 0; i < links.length; i++) {
        var linkEl = links[i];
        var newUrl = this.replaceFunc(linkEl.href, 'link', linkEl);
        if (newUrl) {
            var node = document.createElement('link');
            this.extendAttr(linkEl, node);

            node.href = newUrl;
            var that = this;
            node.onload = function () {
                // 加载完成再检查次替换背景图
                that.replaceBackGroundImage();
            };
            links[i].parentNode.insertBefore(node, links[i]);
            links[i].parentNode.removeChild(links[i]);
        }
    }
}
/**
 * @desc replace img src
 *  */
function relaceImgSrc() {
    var imgs = document.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
        var imgEl = imgs[i];
        var newUrl = this.replaceFunc(imgEl.src, 'imgage', imgEl);
        if (newUrl) {
            this.switchCache['IMAGE'].push(imgEl.src);
            imgEl.src = newUrl;
        }
    }
}
/**
 * @desc replace backgroundImage
 *  */
function replaceBackGroundImage() {
    // detect is support styleSheets
    var isSupportStyleSheets = document.styleSheets && document.styleSheets[0];
    if (!isSupportStyleSheets) return false;

    var styleSheetsLength = document.styleSheets.length;
    for (var i = 0; i < styleSheetsLength; i++) {
        var styleSheets = document.styleSheets[i];
        // chrome64 version forbid cors access css rules
        try {
            if (!(styleSheets.rules && styleSheets.rules.length > 0)) {
                continue;
            }
            for (var j = 0; j < styleSheets.rules.length; j++) {
                var item = styleSheets.rules[j];
                var backgroundImage = item.selectorText && item.style && item.style.backgroundImage;
                if (!backgroundImage) {
                    continue;
                }
                var newUrl = this.replaceFunc(backgroundImage, 'backgroundImage', item);
                if (!newUrl) {
                    continue;
                }
                var cssText = item.selectorText + "{ background-image:" + newUrl + "}";
                var cssTextKey = i + cssText;
                if (this.switchCache['BACKGROUNDIMAGE'].indexOf(cssTextKey) != -1) {
                    this.switchCache['BACKGROUNDIMAGE'].push(cssTextKey);
                    // insertRule tail styleSheets
                    styleSheets.insertRule(cssText, styleSheets.rules.length);

                }
            }
        } catch (err) {
            debugger
            console.log('CdnAssetsSwitch replaceBackGroundImage', err);
        }
    }
}
// plan2: inline you entry code
/**
 * @desc replace webpack PublicUrl
 * @param webpack_require 请在模块代码里传入 __webpack_require__
 *  */
function replaceWebpackPublicUrl(webpack_require) {
    if (!(webpack_require && webpack_require.p)) {
        return false;
    }
    window.__webpack_require__ = webpack_require;
    var newUrl = this.replaceFunc(__webpack_require__.p, 'webpack', webpack_require);
    if (newUrl) {
        __webpack_require__.p = newUrl;
    }
}
// plan1: inline after runtime code,can replace publicUrl
function hackWebpack(webpackModuelId) {
    var that = this;
    webpackModuelId = webpackModuelId || 'cdnAssetsSwitchWebpack';

    var chunkIds = [webpackModuelId];
    var moreModules = {};
    moreModules[webpackModuelId] = (function (module, exports, __webpack_require__) {
        if (__webpack_require__) {
            window.__webpack_require__ = __webpack_require__;
            var newUrl = that.replaceFunc(__webpack_require__.p, 'webpack', __webpack_require__);
            if (newUrl) {
                __webpack_require__.p = newUrl;
            }
        }
    })
    var executeModules = [
        [webpackModuelId]
    ];
    (window["webpackJsonp"] = window["webpackJsonp"] || []).push([chunkIds, moreModules, executeModules]);
}
/* harmony default export */ __webpack_exports__["default"] = (CdnAssetsSwitch);

/***/ })
/******/ ]);
});