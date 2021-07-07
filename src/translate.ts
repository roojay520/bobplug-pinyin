import * as Bob from '@bob-plug/core';
import cnchar from 'cnchar';
import 'cnchar-trad';
import hansOrHant from 'traditional-or-simplified';

interface QueryOption {
  to?: Bob.Language;
  from?: Bob.Language;
  cache?: string;
}

var resultCache = new Bob.CacheResult();

/**
 * @description 汉字转拼音
 * @param {string} text 需要翻译的文字内容
 * @param {object} [options={}]
 * @return {object} 一个符合 bob 识别的翻译结果对象
 */
async function _translate(text: string, options: QueryOption = {}): Promise<Bob.TranslateResult> {
  const { from = 'auto', to = 'auto', cache = 'enable' } = options;
  const cacheKey = `${text}${from}${to}`;
  if (cache === 'enable') {
    const _cacheData = resultCache.get(cacheKey);
    if (_cacheData) return _cacheData;
  } else {
    resultCache.clear();
  }

  const result: Bob.TranslateResult = { from, to, toParagraphs: [] };

  try {
    const isZh = /\p{Unified_Ideograph}/u.test(text);
    if (isZh) {
      const pinyin = cnchar.spell(cnchar.convert.sparkToSimple(text), 'array', 'tone');
      Bob.api.$log.info(JSON.stringify(pinyin));
      result.toParagraphs = Array.isArray(pinyin) ? [pinyin.join(' ')] : [pinyin];
      const str1 = cnchar.convert.simpleToTrad(text); // 简体 => 繁体
      const str3 = cnchar.convert.tradToSimple(text); // 繁体 => 简体
      const str2 = cnchar.convert.simpleToSpark(text); // 简体 => 火星文
      const str4 = cnchar.convert.tradToSpark(text); // 繁体 => 火星文
      const isZhHant = hansOrHant.isTraditional(text);
      Bob.api.$log.info(`${isZhHant} ${text}`);
      result.toDict = {
        addtions: [
          { name: isZhHant ? '简体' : '繁体', value: isZhHant ? str3 : str1 },
          { name: '火星文', value: isZhHant ? str4 : str2 },
        ],
      };
    } else {
      result.toParagraphs = [text];
    }
  } catch (error) {
    throw Bob.util.error('api', '数据解析错误出错', error);
  }

  if (cache === 'enable') {
    resultCache.set(cacheKey, result);
  }
  return result;
}

export { _translate };
