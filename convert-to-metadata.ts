import { isStandardHtmlNode, uuid } from "./tools";

export interface INodeMetadata {
  content: string;
  tagName: string;
  style: {
    fontWeight: string;
    fontSize: string;
    fontStyle: string;
    textDecoration: string;
    backgroundColor: string;
    color: string;
    marginTop: string;
    marginBottom: string;
    listStyleType: string;
    [key: string]: string | number;
  },
  props: {
    bold: boolean;
    src: string;
    alt: string;
    href: string;
    className: string;
    [key: string]: string | number | boolean;
  },
  id: string;
  child: INodeMetadata[];
}

export class ConvertToMetadata {

  /**
   * id 池
   */
  idPool: string[] = [];
  /**
   * 字体 大小 池
   */
  fontSizePool: number[] = [];
  /**
   * 字体 粗细 池
   */
  fontWeightPool: number[] = [];
  public articleContent:HTMLElement
  constructor(articleContent:HTMLElement) {
    this.articleContent = articleContent
  }

  run () {
    let rootNode:INodeMetadata = {
      content: "",
      tagName: this.articleContent.tagName,
      style: {
        fontWeight: "",
        fontSize: "",
        fontStyle: "",
        textDecoration: "",
        backgroundColor: "",
        color: "",
        marginTop: "",
        marginBottom: "",
        listStyleType: "none"
      },
      props: {
        bold: false,
        src: "",
        alt: "",
        href: "",
        className: ""
      },
      id: "root",
      child:[]
    }
    rootNode = this._parseNode(this.articleContent!.firstChild!, rootNode);
    return {
      metadata: rootNode,
      fontSizePool: this.fontSizePool,
      fontWeightPool: this.fontWeightPool
    }
  }

  _parseNode (node: ChildNode, parentNodeMetadata: INodeMetadata): INodeMetadata {
    let currentNode = this._createEmptyMetadata();
    let currentNodeId = this._createId();
    currentNode.id = currentNodeId;
    if (node.nodeType === 3) {
      let textContent = node.textContent!.replaceAll('\n',"");
      if (textContent.length) {
        currentNode.content = textContent;
        currentNode.tagName = "#text";
        currentNode.content.length && parentNodeMetadata.child.push(currentNode);
        if (node.nextSibling) {
          this._parseNode(node.nextSibling, parentNodeMetadata);
        }
      } else {
        if (node.nextSibling) {
          this._parseNode(node.nextSibling, parentNodeMetadata);
        }
        if (node.childNodes.length) {
          this._parseNode(node.childNodes[0], parentNodeMetadata);
        }
        return parentNodeMetadata;
      }
    } else {
      if (!isStandardHtmlNode(node as HTMLElement)
      ) {
        if (node.nextSibling) {
          this._parseNode(node.nextSibling, parentNodeMetadata);
        }
        if (node.childNodes.length) {
          this._parseNode(node.childNodes[0], parentNodeMetadata);
        }
        return parentNodeMetadata;
      }
      if ((node.nodeName === 'PRE' || node.nodeName === 'CODE')) {
        currentNode.props.className = (node as HTMLElement).className;
      }
      currentNode.tagName = node.nodeName;
      currentNode.style.fontSize = (node as HTMLElement).getAttribute('font-size') || '';
      currentNode.style.fontWeight = (node as HTMLElement).getAttribute('font-weight') || '';
      currentNode.style.backgroundColor = (node as HTMLElement).getAttribute('background-color') || '';
      currentNode.style.color = (node as HTMLElement).getAttribute('color') || '';
      currentNode.style.fontStyle = (node as HTMLElement).getAttribute('fon-style') || '';
      currentNode.style.textDecoration = (node as HTMLElement).getAttribute('text-decoration') || '';
      currentNode.style.marginTop = (node as HTMLElement).getAttribute('margin-top') || '';
      currentNode.style.marginBottom = (node as HTMLElement).getAttribute('margin-bottom') || '';
      if ((node as HTMLElement).getAttribute('float')) {
        currentNode.style.float = (node as HTMLElement).getAttribute('float') || '';
        if ((node as HTMLElement).getAttribute('clear')) {
          currentNode.style.clear = (node as HTMLElement).getAttribute('clear') || '';
        }
      }
      this._collectInfo(currentNode.style);
      if (currentNode.tagName === 'IMG') {
        currentNode.props.src = (node as HTMLImageElement).getAttribute('data-src') || (node as HTMLImageElement).getAttribute('src') || '';
        currentNode.props.alt = (node as HTMLImageElement).getAttribute('alt') || '';
      } else if (currentNode.tagName === 'LI' || currentNode.tagName === 'UL' || currentNode.tagName === 'OL') {
        currentNode.style.listStyleType = (node as HTMLElement).getAttribute('list-style-type') || '';
        let start = (node as HTMLElement).getAttribute('start');
        if (start) {
          currentNode.props.start = +start;
        }
      } else if (currentNode.tagName === 'A') {
        currentNode.props.href = (node as HTMLAnchorElement).getAttribute('data-href') || (node as HTMLAnchorElement).getAttribute('href') || '';
      } else if (node.nodeName === 'TD' || node.nodeName === 'TH') {
        let colspan = (node as HTMLElement).getAttribute('colspan');
        if (colspan) {
          currentNode.props.colspan = +colspan;
        }
      }
      if (node.childNodes && node.childNodes.length) {
        this._parseNode(node.firstChild!, currentNode);
      };
      parentNodeMetadata.child.push(currentNode);
      if (node.nextSibling) {
        this._parseNode(node.nextSibling, parentNodeMetadata);
      }
      if (currentNode.child.length === 1 &&
        (currentNode.tagName === 'DIV' || currentNode.tagName === 'SPAN' || currentNode.tagName === 'SECTION' || currentNode.tagName === 'ARTICLE')) {
        if (currentNode.child[0].child.length === 1 && currentNode.child[0].child[0].tagName !== '#text') {
          currentNode.style = { ...currentNode.child[0].style };
          currentNode.tagName = currentNode.child[0].tagName;
          currentNode.props = { ...currentNode.child[0].props };
          currentNode.child = currentNode.child[0].child;
        }
      }
    }
    return currentNode;
  }

  _createEmptyMetadata ():INodeMetadata {
    return {
      content: "",
      tagName: "",
      style: {
        fontWeight: "",
        fontSize: "",
        fontStyle: "",
        textDecoration: "",
        color: "",
        backgroundColor: "",
        marginTop: "",
        marginBottom: "",
        listStyleType: "none"
  },
      props: {
        bold: false,
        src: "",
        alt: "",
        href: "",
        className: ""
      },
      id: "",
      child: []
    }
  }
  _createId () {
    let id = uuid()
    while(this.idPool.includes(id)) {
      id = uuid()
    }
    return id;
  }
  _collectInfo (style:{fontWeight: string; fontSize: string}) {
    if (style.fontSize) {
      let num = this._distillNumber(style.fontSize);
      if (!this.fontSizePool.includes(+num)) {
        this.fontSizePool.push(+num);
      }
    };
    if (style.fontWeight) {
      if (!this.fontWeightPool.includes(+style.fontWeight)) {
        this.fontWeightPool.push(+style.fontWeight);
      }
    }
  }
  private _distillNumber (str: string) {
    if (!str.length) return 0;
    const matches = str.match(/\d+/g);
    return matches ? +matches[0] : 0;
  }
}