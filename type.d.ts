interface IContentNode {
  content: string;
  children: IContentNode[];
  parentId: string;
  id: string;
  style: {
    fontWeight: string;
    fontSize: string;
    color: string;
    backgroundColor: string;
  },
  props: {
    bold: boolean;// 如果用 strong、b 标签包裹，这个值为 true；说明可能是一个小标题
    tagName: string;// 标签类型，如 h1、h2、h3、h4、h5、h6、p、span、section、article、div 等
  }
}

interface IStyleTable {
  fontSize: { [key: string]: number },
  fontWeight: { [key: string]: number },
  color: { [key: string]: number },
  backgroundColor: { [key: string]: number },
}

interface IContentTreeNode {
  content: string;
  score: number;
  child: IContentTreeNode[];
  style: {
    fontWeight: string;
    fontSize: string;
    color: string;
    backgroundColor: string;
  }
}

/**
 * 总结文章的结构
 */
interface ISummaryArticle {
  content: string;
  title: string;
  charactersNumber: number;
  url: string;
  id?: string;
}

interface ISummaryArticleNode {
  content: string;
  score: number;
  children: ISummaryArticleNode[];
}

interface IReaderAbleOptions {
  /**
   * The minimum node content length used to decide if the document is readerable.
   */
  minContentLength?: number;
  /**
   * The minumum cumulated 'score' used to determine if the document is readerable.
   */
  minScore?: number;
  /**
   * The function used to determine if a node is visible.
   * @param node
   * @returns
   */
  visibilityChecker?: (node: HTMLElement | SVGElement | MathMLElement) => boolean;
}


