/**
 * uuid 工具函数
 */
export function uuid () {
  let d = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    // eslint-disable-next-line no-bitwise
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })

  return uuid
}



/**
 * 根据url获取域名
 */
export function getHost (url: string) {
  var _url = new URL(
    url,
  );
  return _url.hostname;
}

/**
 * Checks if a given node is a standard HTML element.
 * @param node - The node to check.
 * @returns True if the node is a standard HTML element, otherwise false.
 */
export function isStandardHtmlNode (node: Node): boolean {
  if (!node || typeof node.nodeName !== "string") {
    return false;
  }

  // List of all standard HTML elements
  //  remove "meta",
  const standardHtmlTags = new Set([
    "!DOCTYPE",
    "html",
    "head",
    "title",
    "base",
    "link",
    "style",
    "body",
    "header",
    "nav",
    "section",
    "article",
    "aside",
    "footer",
    "address",
    "main",
    "div",
    "span",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "hr",
    "pre",
    "blockquote",
    "ol",
    "ul",
    "li",
    "dl",
    "dt",
    "dd",
    "figure",
    "figcaption",
    "table",
    "caption",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "a",
    "em",
    "strong",
    "small",
    "s",
    "cite",
    "q",
    "dfn",
    "abbr",
    "ruby",
    "rt",
    "rp",
    "data",
    "time",
    "code",
    "var",
    "samp",
    "kbd",
    "sub",
    "sup",
    "i",
    "b",
    "u",
    "mark",
    "bdi",
    "bdo",
    "br",
    "wbr",
    "img",
    "iframe",
    "embed",
    "object",
    "param",
    "video",
    "audio",
    "source",
    "track",
    "map",
    "area",
    "canvas",
    "svg",
    "picture",
    "noscript",
    "script",
    "del",
    "ins",
    "form",
    "label",
    "input",
    "button",
    "select",
    "datalist",
    "optgroup",
    "option",
    "textarea",
    "output",
    "progress",
    "meter",
    "fieldset",
    "legend",
    "base",
    "link",
    "style",
    "title",
    "script",
    "noscript",
    "template",
    "slot"
  ]);

  return standardHtmlTags.has(node.nodeName.toLowerCase());
}

/**
 * 判断是否是url
 */
export function isUri (text: string) {
  return /^(http|https):\/\/[\w.]+?\.[\w]+/.test(text)
}

/**
 *
 * @returns 当前时间戳
 */
export function getCurrentDateTime () {
  return new Date().getTime();
}

/**
 *
 * @returns 当前时区
 */
export function getCurrentTimeZone () {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timeZone;
}

/**
 * 深度拷贝数据（支持对象/数组/基本类型）
 * @param source 要拷贝的数据
 * @returns 深拷贝后的新数据
 */
export function deepClone<T> (source: T): T {
  // 处理基本类型和 null/undefined
  if (source === null || typeof source !== 'object') {
    return source
  }

  // 处理 Date 对象
  if (source instanceof Date) {
    return new Date(source.getTime()) as T
  }

  // 处理 Array
  if (Array.isArray(source)) {
    const copy = [] as unknown[]
    for (const item of source) {
      copy.push(deepClone(item))
    }
    return copy as T
  }

  // 处理普通对象
  if (source instanceof Object) {
    const copy = {} as Record<string, unknown>
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        copy[key] = deepClone(source[key])
      }
    }
    return copy as T
  }

  // 其他类型（如 RegExp、Map、Set 等需要特殊处理时在此扩展）
  return source
}

export function isWikipedia (url: string) {
  return url.includes('wikipedia');
}