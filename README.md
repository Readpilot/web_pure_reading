# web_pure_reading
The pure reading of web page。
This library can extract content from web pages and return it in a structured data format.
It can detect whether a page is readable.

## Introduce
This library is based on [readability](https://github.com/mozilla/readability).
It is written in typescript.
This library is the core code for [Readipal Extension](https://chromewebstore.google.com/detail/ohbagkonibeldkfdlnhfomidenpbgdaj?authuser=0&hl=zh-CN) Pure reading feature.

## Usage

```js
import { Readability,isProbablyReaderAble } from "web_pure_reading";
/**
 * isProbablyReaderAble - Determine whether a page is readable
 * @param {string} html - The HTML content of the page
 * @returns {boolean} - True if the page is readable, false otherwise
 */
if(isProbablyReaderAble(html)){
  /**
   * Readability - Extract content from a web page
   * @param {string} html - The HTML content of the page
   * @returns {object} - The extracted content
   *
   * @property {string} title - The title of the article
   * @property {string} byline - The byline of the article
   * @property {string} content - The content of the article
   * @property {string} excerpt - The excerpt of the article
   * @property {string} dir - The direction of the article
   * @property {string} siteName - The name of the site
   * @property {string} lang - The language of the article
   * @property {Object} nodeMetadata - The nodeMetadata of the article
   */
  const readability = new Readability();
  const article = readability.parse(html);
}
```
