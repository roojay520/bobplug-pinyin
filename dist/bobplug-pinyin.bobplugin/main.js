'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var api = {
  $http,
  $info,
  $log,
  $data,
  $file,
  getOption: (key) => $option[key]
};

var __defProp$1 = Object.defineProperty;
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$1 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$1.call(b, prop))
      __defNormalProp$1(a, prop, b[prop]);
  if (__getOwnPropSymbols$1)
    for (var prop of __getOwnPropSymbols$1(b)) {
      if (__propIsEnum$1.call(b, prop))
        __defNormalProp$1(a, prop, b[prop]);
    }
  return a;
};
var __async$1 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function error(type = "unknown", message = "\u63D2\u4EF6\u51FA\u9519", addtion = {}) {
  return {
    type,
    message,
    addtion: JSON.stringify(addtion)
  };
}
var isArray = (val) => Array.isArray(val);
var isArrayAndLenGt = (val, len = 0) => isArray(val) && val.length > len;
var isString = (val) => typeof val === "string";
var isPlainObject = (val) => !!val && typeof val === "object" && val.constructor === Object;
var isNil = (val) => val === void 0 || val === null;
function deepClone(obj) {
  if (!isPlainObject)
    return obj;
  const clone = __spreadValues$1({}, obj);
  Object.keys(clone).forEach((key) => clone[key] = typeof obj[key] === "object" ? deepClone(obj[key]) : obj[key]);
  return Array.isArray(obj) ? (clone.length = obj.length) && Array.from(clone) : clone;
}
function getType(v) {
  return Reflect.toString.call(v).slice(8, -1).toLowerCase();
}
function asyncTo(promise, errorExt) {
  return __async$1(this, null, function* () {
    try {
      const data = yield promise;
      const result = [null, data];
      return result;
    } catch (_err) {
      let err = _err;
      if (errorExt) {
        Object.assign(err, errorExt);
      }
      const resultArr = [err, void 0];
      return resultArr;
    }
  });
}
var util = {
  error,
  isString,
  isArray,
  isNil,
  isArrayAndLenGt,
  isPlainObject,
  deepClone,
  getType,
  asyncTo
};

class Cache {
  constructor(nameSpace = "bobplug-cache") {
    this._cacheFilePath = "";
    this._store = {};
    this._cacheFilePath = `$sandbox/cache/${nameSpace}.json`;
    this._read();
  }
  _write() {
    const json = JSON.stringify(this._store);
    api.$file.write({
      data: api.$data.fromUTF8(json),
      path: this._cacheFilePath
    });
  }
  _read() {
    var exists = api.$file.exists(this._cacheFilePath);
    if (exists) {
      var data = api.$file.read(this._cacheFilePath);
      this._store = JSON.parse(data.toUTF8());
    } else {
      this._store = {};
      this._write();
    }
  }
  set(key, value) {
    if (!isString(key))
      return;
    this._store[key] = value;
    this._write();
  }
  get(key) {
    if (!isString(key))
      return null;
    return this._store[key];
  }
  getAll() {
    return this._store;
  }
  remove(key) {
    if (!isString(key))
      return;
    delete this._store[key];
    this._write();
  }
  clear() {
    this._store = {};
    this._write();
  }
}

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var CryptoJS = require("crypto-js");
class CacheResult {
  constructor(nameSpace) {
    this._resultCacheStore = new Cache(nameSpace || "result-cache");
    let result = this._resultCacheStore.get("result") || {};
    if (!util.isPlainObject(result))
      result = {};
    this._result = result;
  }
  _save() {
    this._resultCacheStore.set("result", __spreadValues({}, this._result));
  }
  get(key) {
    if (!util.isString(key))
      return null;
    const md5 = CryptoJS.MD5(key).toString();
    const result = this._result[md5];
    if (!util.isPlainObject(result))
      return null;
    const { time, data } = result;
    const cacheUpdateTime = 1e3 * 60 * 60 * 24 * 7;
    if (Date.now() - cacheUpdateTime > time) {
      delete this._result[md5];
      this._save();
      return null;
    }
    return data;
  }
  set(key, val) {
    if (!util.isString(key) && !util.isPlainObject(val) && !util.isArrayAndLenGt(val.toParagraphs, 0))
      return;
    const md5 = CryptoJS.MD5(key).toString();
    const result = { time: Date.now(), data: val };
    this._result[md5] = result;
    this._save();
  }
  clear() {
    this._resultCacheStore.clear();
  }
}

var LanguagesEnum;
(function(LanguagesEnum2) {
  LanguagesEnum2["auto"] = "\u81EA\u52A8";
  LanguagesEnum2["zh-Hans"] = "\u4E2D\u6587\u7B80\u4F53";
  LanguagesEnum2["zh-Hant"] = "\u4E2D\u6587\u7E41\u4F53";
  LanguagesEnum2["yue"] = "\u7CA4\u8BED";
  LanguagesEnum2["wyw"] = "\u6587\u8A00\u6587";
  LanguagesEnum2["pysx"] = "\u62FC\u97F3\u7F29\u5199";
  LanguagesEnum2["en"] = "\u82F1\u8BED";
  LanguagesEnum2["ja"] = "\u65E5\u8BED";
  LanguagesEnum2["ko"] = "\u97E9\u8BED";
  LanguagesEnum2["fr"] = "\u6CD5\u8BED";
  LanguagesEnum2["de"] = "\u5FB7\u8BED";
  LanguagesEnum2["es"] = "\u897F\u73ED\u7259\u8BED";
  LanguagesEnum2["it"] = "\u610F\u5927\u5229\u8BED";
  LanguagesEnum2["ru"] = "\u4FC4\u8BED";
  LanguagesEnum2["pt"] = "\u8461\u8404\u7259\u8BED";
  LanguagesEnum2["nl"] = "\u8377\u5170\u8BED";
  LanguagesEnum2["pl"] = "\u6CE2\u5170\u8BED";
  LanguagesEnum2["ar"] = "\u963F\u62C9\u4F2F\u8BED";
  LanguagesEnum2["af"] = "\u5357\u975E\u8BED";
  LanguagesEnum2["am"] = "\u963F\u59C6\u54C8\u62C9\u8BED";
  LanguagesEnum2["az"] = "\u963F\u585E\u62DC\u7586\u8BED";
  LanguagesEnum2["be"] = "\u767D\u4FC4\u7F57\u65AF\u8BED";
  LanguagesEnum2["bg"] = "\u4FDD\u52A0\u5229\u4E9A\u8BED";
  LanguagesEnum2["bn"] = "\u5B5F\u52A0\u62C9\u8BED";
  LanguagesEnum2["bo"] = "\u85CF\u8BED";
  LanguagesEnum2["bs"] = "\u6CE2\u65AF\u5C3C\u4E9A\u8BED";
  LanguagesEnum2["ca"] = "\u52A0\u6CF0\u9686\u8BED";
  LanguagesEnum2["ceb"] = "\u5BBF\u52A1\u8BED";
  LanguagesEnum2["chr"] = "\u5207\u7F57\u57FA\u8BED";
  LanguagesEnum2["co"] = "\u79D1\u897F\u5609\u8BED";
  LanguagesEnum2["cs"] = "\u6377\u514B\u8BED";
  LanguagesEnum2["cy"] = "\u5A01\u5C14\u58EB\u8BED";
  LanguagesEnum2["da"] = "\u4E39\u9EA6\u8BED";
  LanguagesEnum2["el"] = "\u5E0C\u814A\u8BED";
  LanguagesEnum2["eo"] = "\u4E16\u754C\u8BED";
  LanguagesEnum2["et"] = "\u7231\u6C99\u5C3C\u4E9A\u8BED";
  LanguagesEnum2["eu"] = "\u5DF4\u65AF\u514B\u8BED";
  LanguagesEnum2["fa"] = "\u6CE2\u65AF\u8BED";
  LanguagesEnum2["fi"] = "\u82AC\u5170\u8BED";
  LanguagesEnum2["fj"] = "\u6590\u6D4E\u8BED";
  LanguagesEnum2["fy"] = "\u5F17\u91CC\u897F\u8BED";
  LanguagesEnum2["ga"] = "\u7231\u5C14\u5170\u8BED";
  LanguagesEnum2["gd"] = "\u82CF\u683C\u5170\u76D6\u5C14\u8BED";
  LanguagesEnum2["gl"] = "\u52A0\u5229\u897F\u4E9A\u8BED";
  LanguagesEnum2["gu"] = "\u53E4\u5409\u62C9\u7279\u8BED";
  LanguagesEnum2["ha"] = "\u8C6A\u8428\u8BED";
  LanguagesEnum2["haw"] = "\u590F\u5A01\u5937\u8BED";
  LanguagesEnum2["he"] = "\u5E0C\u4F2F\u6765\u8BED";
  LanguagesEnum2["hi"] = "\u5370\u5730\u8BED";
  LanguagesEnum2["hmn"] = "\u82D7\u8BED";
  LanguagesEnum2["hr"] = "\u514B\u7F57\u5730\u4E9A\u8BED";
  LanguagesEnum2["ht"] = "\u6D77\u5730\u514B\u91CC\u5965\u5C14\u8BED";
  LanguagesEnum2["hu"] = "\u5308\u7259\u5229\u8BED";
  LanguagesEnum2["hy"] = "\u4E9A\u7F8E\u5C3C\u4E9A\u8BED";
  LanguagesEnum2["id"] = "\u5370\u5C3C\u8BED";
  LanguagesEnum2["ig"] = "\u4F0A\u535A\u8BED";
  LanguagesEnum2["is"] = "\u51B0\u5C9B\u8BED";
  LanguagesEnum2["jw"] = "\u722A\u54C7\u8BED";
  LanguagesEnum2["ka"] = "\u683C\u9C81\u5409\u4E9A\u8BED";
  LanguagesEnum2["kk"] = "\u54C8\u8428\u514B\u8BED";
  LanguagesEnum2["km"] = "\u9AD8\u68C9\u8BED";
  LanguagesEnum2["kn"] = "\u5361\u7EB3\u8FBE\u8BED";
  LanguagesEnum2["ku"] = "\u5E93\u5C14\u5FB7\u8BED";
  LanguagesEnum2["ky"] = "\u67EF\u5C14\u514B\u5B5C\u8BED";
  LanguagesEnum2["la"] = "\u8001\u631D\u8BED";
  LanguagesEnum2["lb"] = "\u5362\u68EE\u5821\u8BED";
  LanguagesEnum2["lo"] = "\u8001\u631D\u8BED";
  LanguagesEnum2["lt"] = "\u7ACB\u9676\u5B9B\u8BED";
  LanguagesEnum2["lv"] = "\u62C9\u8131\u7EF4\u4E9A\u8BED";
  LanguagesEnum2["mg"] = "\u9A6C\u5C14\u52A0\u4EC0\u8BED";
  LanguagesEnum2["mi"] = "\u6BDB\u5229\u8BED";
  LanguagesEnum2["mk"] = "\u9A6C\u5176\u987F\u8BED";
  LanguagesEnum2["ml"] = "\u9A6C\u62C9\u96C5\u62C9\u59C6\u8BED";
  LanguagesEnum2["mn"] = "\u8499\u53E4\u8BED";
  LanguagesEnum2["mr"] = "\u9A6C\u62C9\u5730\u8BED";
  LanguagesEnum2["ms"] = "\u9A6C\u6765\u8BED";
  LanguagesEnum2["mt"] = "\u9A6C\u8033\u4ED6\u8BED";
  LanguagesEnum2["mww"] = "\u767D\u82D7\u8BED";
  LanguagesEnum2["my"] = "\u7F05\u7538\u8BED";
  LanguagesEnum2["ne"] = "\u5C3C\u6CCA\u5C14\u8BED";
  LanguagesEnum2["no"] = "\u632A\u5A01\u8BED";
  LanguagesEnum2["ny"] = "\u9F50\u5207\u74E6\u8BED";
  LanguagesEnum2["or"] = "\u5965\u91CC\u4E9A\u8BED";
  LanguagesEnum2["otq"] = "\u514B\u96F7\u5854\u7F57\u5965\u6258\u7C73\u8BED";
  LanguagesEnum2["pa"] = "\u65C1\u906E\u666E\u8BED";
  LanguagesEnum2["ps"] = "\u666E\u4EC0\u56FE\u8BED";
  LanguagesEnum2["ro"] = "\u7F57\u9A6C\u5C3C\u4E9A\u8BED";
  LanguagesEnum2["rw"] = "\u5362\u65FA\u8FBE\u8BED";
  LanguagesEnum2["sd"] = "\u4FE1\u5FB7\u8BED";
  LanguagesEnum2["si"] = "\u50E7\u4F3D\u7F57\u8BED";
  LanguagesEnum2["sk"] = "\u65AF\u6D1B\u4F10\u514B\u8BED";
  LanguagesEnum2["sl"] = "\u65AF\u6D1B\u6587\u5C3C\u4E9A\u8BED";
  LanguagesEnum2["sm"] = "\u8428\u6469\u4E9A\u8BED";
  LanguagesEnum2["sn"] = "\u4FEE\u7EB3\u8BED";
  LanguagesEnum2["so"] = "\u7D22\u9A6C\u91CC\u8BED";
  LanguagesEnum2["sq"] = "\u963F\u5C14\u5DF4\u5C3C\u4E9A\u8BED";
  LanguagesEnum2["sr"] = "\u585E\u5C14\u7EF4\u4E9A\u8BED";
  LanguagesEnum2["sr-Cyrl"] = "\u585E\u5C14\u7EF4\u4E9A\u8BED-\u897F\u91CC\u5C14\u6587";
  LanguagesEnum2["sr-Latn"] = "\u585E\u5C14\u7EF4\u4E9A\u8BED-\u62C9\u4E01\u6587";
  LanguagesEnum2["st"] = "\u585E\u7D22\u6258\u8BED";
  LanguagesEnum2["su"] = "\u5DFD\u4ED6\u8BED";
  LanguagesEnum2["sv"] = "\u745E\u5178\u8BED";
  LanguagesEnum2["sw"] = "\u65AF\u74E6\u5E0C\u91CC\u8BED";
  LanguagesEnum2["ta"] = "\u6CF0\u7C73\u5C14\u8BED";
  LanguagesEnum2["te"] = "\u6CF0\u5362\u56FA\u8BED";
  LanguagesEnum2["tg"] = "\u5854\u5409\u514B\u8BED";
  LanguagesEnum2["th"] = "\u6CF0\u8BED";
  LanguagesEnum2["tk"] = "\u571F\u5E93\u66FC\u8BED";
  LanguagesEnum2["tl"] = "\u83F2\u5F8B\u5BBE\u8BED";
  LanguagesEnum2["tlh"] = "\u514B\u6797\u8D21\u8BED";
  LanguagesEnum2["to"] = "\u6C64\u52A0\u8BED";
  LanguagesEnum2["tr"] = "\u571F\u8033\u5176\u8BED";
  LanguagesEnum2["tt"] = "\u9791\u977C\u8BED";
  LanguagesEnum2["ty"] = "\u5854\u5E0C\u63D0\u8BED";
  LanguagesEnum2["ug"] = "\u7EF4\u543E\u5C14\u8BED";
  LanguagesEnum2["uk"] = "\u4E4C\u514B\u5170\u8BED";
  LanguagesEnum2["ur"] = "\u4E4C\u5C14\u90FD\u8BED";
  LanguagesEnum2["uz"] = "\u4E4C\u5179\u522B\u514B\u8BED";
  LanguagesEnum2["vi"] = "\u8D8A\u5357\u8BED";
  LanguagesEnum2["xh"] = "\u79D1\u8428\u8BED";
  LanguagesEnum2["yi"] = "\u610F\u7B2C\u7EEA\u8BED";
  LanguagesEnum2["yo"] = "\u7EA6\u9C81\u5DF4\u8BED";
  LanguagesEnum2["yua"] = "\u5C24\u5361\u5766\u739B\u96C5\u8BED";
  LanguagesEnum2["zu"] = "\u7956\u9C81\u8BED";
})(LanguagesEnum || (LanguagesEnum = {}));
var ServiceErrorEnum;
(function(ServiceErrorEnum2) {
  ServiceErrorEnum2["unknown"] = "\u672A\u77E5\u9519\u8BEF";
  ServiceErrorEnum2["param"] = "\u53C2\u6570\u9519\u8BEF";
  ServiceErrorEnum2["unsupportLanguage"] = "\u4E0D\u652F\u6301\u7684\u8BED\u79CD";
  ServiceErrorEnum2["secretKey"] = "\u7F3A\u5C11\u79D8\u94A5";
  ServiceErrorEnum2["network"] = "\u7F51\u7EDC\u5F02\u5E38\uFF0C\u7F51\u7EDC\u8BF7\u5931\u8D25";
  ServiceErrorEnum2["api"] = "\u670D\u52A1\u63A5\u53E3\u5F02\u5E38";
})(ServiceErrorEnum || (ServiceErrorEnum = {}));

var languageList = [
  ["auto", "auto"],
  ["zh-Hans", "zh-CN"],
  ["zh-Hant", "zh-TW"],
  ["en", "en"]
];
new Map(languageList.map(([standardLang, lang]) => [lang, standardLang]));
function getSupportLanguages() {
  return languageList.map(([standardLang]) => standardLang);
}

var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var resultCache = new CacheResult("translate-result");
function _translate(_0) {
  return __async(this, arguments, function* (text, options = {}) {
    const { from = "auto", to = "auto", cache = "enable" } = options;
    const cacheKey = `${text}${from}${to}`;
    if (cache === "enable") {
      const _cacheData = resultCache.get(cacheKey);
      if (_cacheData)
        return _cacheData;
    } else {
      resultCache.clear();
    }
    const result = { from, to, toParagraphs: [] };
    try {
      result.toParagraphs = ["\u6D4B\u8BD5\u6587\u5B57"];
      result.fromParagraphs = [];
    } catch (error) {
      throw util.error("api", "\u6570\u636E\u89E3\u6790\u9519\u8BEF\u51FA\u9519", error);
    }
    if (cache === "enable") {
      resultCache.set(cacheKey, result);
    }
    return result;
  });
}

var formatString = require("./libs/human-string");
function supportLanguages() {
  return getSupportLanguages();
}
function translate(query, completion) {
  const { text = "", detectFrom, detectTo } = query;
  const str = formatString(text);
  const params = { from: detectFrom, to: detectTo, cache: api.getOption("cache") };
  let res = _translate(str, params);
  res.then((result) => completion({ result })).catch((error) => {
    api.$log.error(JSON.stringify(error));
    if (error == null ? void 0 : error.type)
      return completion({ error });
    completion({ error: util.error("api", "\u63D2\u4EF6\u51FA\u9519", error) });
  });
}

exports.supportLanguages = supportLanguages;
exports.translate = translate;
