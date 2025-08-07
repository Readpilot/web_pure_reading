/*
 * Copyright (c) 2010 Arc90 Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * This code is heavily based on Arc90's readability.js (1.7.1) script
 * available at: http://code.google.com/p/arc90labs-readability
 */

/**
 * TODO 需要增加 父级节点在当前页面的权重判断！
 * https://github.blog - this page is not reader-able;
 */

var REGEXPS = {
  // NOTE: These two regular expressions are duplicated in
  // Readability.js. Please keep both copies in sync.
  unlikelyCandidates: /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote|hide/i,
  okMaybeItsACandidate: /and|article|body|column|content|main|shadow/i,
};

function isNodeVisible (node: HTMLElement | SVGElement | MathMLElement):boolean {
  // Have to null-check node.style and node.className.indexOf to deal with SVG and MathML nodes.
  return (!node.style || node.style.display != "none")
    && !node.hasAttribute("hidden")
    //check for "fallback-image" so that wikimedia math images are displayed
    && (!node.hasAttribute("aria-hidden") || node.getAttribute("aria-hidden") != "true" || (node.className && node.className.indexOf && node.className.indexOf("fallback-image") !== -1));
}

/**
 * Decides whether or not the document is reader-able without parsing the whole thing.
 * @param {Object} options Configuration object.
 * @param {number} [options.minContentLength=140] The minimum node content length used to decide if the document is readerable.
 * @param {number} [options.minScore=20] The minumum cumulated 'score' used to determine if the document is readerable.
 * @param {Function} [options.visibilityChecker=isNodeVisible] The function used to determine if a node is visible.
 * @return {boolean} Whether or not we suspect Readability.parse() will suceeed at returning an article object.
 */
export function isProbablyReaderAble (doc: any, options: IReaderAbleOptions = {}) {
  // For backward compatibility reasons 'options' can either be a configuration object or the function used
  // to determine if a node is visible.
  if (typeof options == "function") {
    options = { visibilityChecker: options };
  }

  var defaultOptions:IReaderAbleOptions = { minScore: 20, minContentLength: 140, visibilityChecker: isNodeVisible };
  options = Object.assign(defaultOptions, options);

  var nodes = doc.querySelectorAll("p, pre");
  // TODO 雅虎和华尔街日报首页 无法正确识别
  // Get <div> nodes which have <br> node(s) and append them into the `nodes` variable.
  // Some articles' DOM structures might look like
  // <div>
  //   Sentences<br>
  //   <br>
  //   Sentences<br>
  // </div>
  var brNodes = doc.querySelectorAll("div > br");
  if (brNodes.length) {
    var set = new Set(nodes);
    [].forEach.call(brNodes, function (node: HTMLElement) {
      set.add(node.parentNode);
    });
    nodes = Array.from(set);
  }

  var textNodes = doc.querySelectorAll("section > span, section > p, section > div, section > ul")
  if (textNodes.length) {
    var set = new Set(nodes);
    [].forEach.call(textNodes, function (node: HTMLElement) {
      set.add(node.parentNode);
    });
    nodes = Array.from(set);
  }


  let validNodes:HTMLElement[] = [].filter.call(nodes, function (node: HTMLElement) {
    if (!options.visibilityChecker?.(node)) {
      return false;
    }

    var matchString = node.className + " " + node.id;
    if (REGEXPS.unlikelyCandidates.test(matchString) &&
      !REGEXPS.okMaybeItsACandidate.test(matchString)) {
      return false;
    }

    if (node.matches("li p")) {
      return false;
    }
    var textContentLength = node.textContent?.trim().length || 0;
    if (textContentLength < 120) {
      return false;
    }

    return true;
  });
  if (!validNodes.length) {
    return false;
  } else {
    // 记录所有合法 文本节点的父节点；
    // 当 一个容器节点的文本长度 大于整个容器节点的文本长度的 50 %；则说明 当前页面是一个文章页。否则不是。
    let containerNodesMap = new Map();
    for (let nodeItem of validNodes) {
      let parentNode = nodeItem.parentNode as HTMLElement;
      var matchString = parentNode.className + " " + parentNode.id;
      if (REGEXPS.unlikelyCandidates.test(matchString)) {
        continue;
      }
      if (containerNodesMap.has(parentNode)) {
        containerNodesMap.set(parentNode, {
          textLength: containerNodesMap.get(parentNode).textLength + (nodeItem.textContent?.trim().length || 0),
          valid: true,
          parentNode: null,
          childNodes: containerNodesMap.get(parentNode).childNodes.concat(nodeItem),
        });
      } else {
        containerNodesMap.set(parentNode, {
          textLength: nodeItem.textContent?.trim().length || 0,
          valid: true,
          parentNode: null,
          childNodes: [nodeItem],
        });
      }
    }
    // 默认 最后的容器节点是 文本节点的爷爷节点（父级的 -> 父级）
    let tempContainerNodes = new Map();
    for (const item of containerNodesMap.entries()) {
      let [node, val] = item;
      let parentNode = node.parentNode;
      var matchString = parentNode.className + " " + parentNode.id;
      if (REGEXPS.unlikelyCandidates.test(matchString)) {
        continue;
      }
      if (containerNodesMap.has(parentNode)) {
        containerNodesMap.get(parentNode).textLength = containerNodesMap.get(parentNode).textLength + val.textLength;
      } else {
        if (tempContainerNodes.has(parentNode)) {
          tempContainerNodes.get(parentNode).childData.push(val);
        } else {
          tempContainerNodes.set(parentNode, {
            textLength: 0,
            childData: [val]
          })
        }
      }
    }
    let countTextLength = 0;
    for (const val of tempContainerNodes.values()) {
      for (let childItem of val.childData) {
        val.textLength += childItem.textLength;
      };
      countTextLength += val.textLength;
    };
    for (let val of tempContainerNodes.values()) {
      // console.log('oooo', val.textLength, countTextLength * 0.5)
      if (val.textLength > countTextLength * 0.5) {
        return true;
      }
    };
    // 有可能不规则嵌套的文本节点，需要通过 article 计算是否存在 article 长度超过全部长度一半的。
    let articleNodes = doc.querySelectorAll('article');
    let countArticleTextLength = 0;
    let articleNodeTextArray:string[] = [];
    [].forEach.call(articleNodes, function (node: HTMLElement) {
      countArticleTextLength += node.textContent?.trim().length || 0;
      articleNodeTextArray.push(node.textContent?.trim() || '');
    });
    for (let textLength of articleNodeTextArray) {
      if (textLength.length > countArticleTextLength * 0.5) {
        return true;
      }
    }
  }
}
