import * as TreeSitter from "web-tree-sitter";
class codeParser {
  constructor() {
    this.parser = null;
    this.tree = null;
    this.codeText = "";
    this.htmlText = "";
    this.latexText = "";
  }

  async init() {
    // Load and initialize the parser
    await TreeSitter.init();
    this.parser = new TreeSitter();
    const Lang = await TreeSitter.Language.load(
      "https://tree-sitter.github.io/tree-sitter-python.wasm",
    );
    this.parser.setLanguage(Lang);
  }

  async parseCode(code) {
    console.log("Parsing code...");
    if (this.parser) {
      this.codeText = code;
      this.tree = this.parser.parse(code);
      this.printTree(this.tree.rootNode);
    }
  }

  printTree(node, indent = 0) {
    const padding = " ".repeat(indent);
    const nodeType = node.type;
    const nodeText = this.codeText.slice(node.startIndex, node.endIndex);
    console.log(`${padding}${nodeType}: ${nodeText}`);
    for (let i = 0; i < node.childCount; i++) {
      this.printTree(node.child(i), indent + 2);
    }
  }

  reconstructText(node) {
    // Reconstruct text while preserving spaces and new lines
    let text = "";
    // Helper function to traverse nodes
    const traverse = (node, start) => {
      // text += node.type + "{";
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        // Append the text between the previous end and the start of the current child
        text += this.codeText.slice(start, child.startIndex);
        // Recursively process the child
        traverse(child, child.startIndex);
        // Update the start index to the end of the current child
        start = child.endIndex;
      }
      // Append the text from the last child to the end of the current node
      text += this.codeText.slice(start, node.endIndex);
      // text += "}";
    };
    // Start the traversal from the root node
    traverse(node, node.startIndex);
    return text;
  }

  reconstructHtml(node, codeKeywords, codeStyle) {
    if (!node) {
      return "";
    }
    // Reconstruct text while preserving spaces and new lines
    let htmlText = "";
    let latexText =
      "\\documentclass{article}\n\\input{pythonStyle.tex}\n\\title{Code}\n\\author{txstc55}\n\\begin{document}\n\\maketitle\n";
    latexText += "\\begin{pythonBlock}{}\n";
    // Helper function to traverse nodes
    const traverse = (node, start, parentType) => {
      // htmlText += node.type + "{";
      const nodeType = node.type;
      // print(nodeType);
      console.log(nodeType, node);

      var needSpanEnd = true;
      var lastDelimSymbol = "";
      var i = 0; // in case we need to skip any child
      if (nodeType == "parameters") {
        // function parameters
        for (i; i < node.childCount; i++) {
          const child = node.child(i);
          if (child.type == "identifier") {
            htmlText +=
              "<span style='color: " +
              codeStyle.colors.parameterColor.value +
              "'>";
            latexText += "|@";
          }
          htmlText += this.codeText.slice(start, child.startIndex);
          latexText += this.codeText.slice(start, child.startIndex);
          traverse(child, child.startIndex, nodeType);
          start = child.endIndex;
          if (child.type == "identifier") {
            htmlText += "</span>";
            latexText += "@|";
          }
        }
        needSpanEnd = false;
      } else if (nodeType == "function_definition") {
        // function definition
        for (i; i < node.childCount; i++) {
          const child = node.child(i);
          if (child.type == "identifier") {
            htmlText +=
              "<span style='color: " +
              codeStyle.colors.functionColor.value +
              "'>";
            latexText += "*|";
          }
          htmlText += this.codeText.slice(start, child.startIndex);
          latexText += this.codeText.slice(start, child.startIndex);
          traverse(child, child.startIndex, nodeType);
          start = child.endIndex;
          if (child.type == "identifier") {
            htmlText += "</span>";
            latexText += "|*";
          }
        }
        needSpanEnd = false;
      } else if (nodeType == "string") {
        htmlText +=
          "<span style='color: " + codeStyle.colors.stringColor.value + "'>";
        needSpanEnd = true;
      } else if (nodeType == "call") {
        // color for function call
        if (node.child(0).type == "identifier") {
          // this is just a function call like
          // call() not abc.call()
          // so we color it as call
          const child = node.child(0);
          htmlText +=
            "<span style='color: " + codeStyle.colors.callColor.value + "'>";
          latexText += "|!";
          htmlText += this.codeText.slice(start, child.startIndex);
          latexText += this.codeText.slice(start, child.startIndex);
          traverse(child, child.startIndex, nodeType);
          htmlText += "</span>";
          latexText += "!|";
          i = 1;
          start = child.endIndex;
        }
        needSpanEnd = false;
      } else if (nodeType == "attribute") {
        // we will loop all previous child except the last one
        for (i; i < node.childCount - 1; i++) {
          const child = node.child(i);
          htmlText += this.codeText.slice(start, child.startIndex);
          latexText += this.codeText.slice(start, child.startIndex);
          traverse(child, child.startIndex, nodeType);
          start = child.endIndex;
        }
        // deal with the last child, which is the attribute itself
        const child = node.child(i);
        // console.log("At attribute, parent type: ", parentType);
        if (parentType == "call") {
          htmlText +=
            "<span style='color: " + codeStyle.colors.callColor.value + "'>";
          latexText += "|!";
          lastDelimSymbol = "!|";
        } else {
          htmlText +=
            "<span style='color: " +
            codeStyle.colors.attributeColor.value +
            "'>";
          latexText += "|?";
          lastDelimSymbol = "?|";
        }

        htmlText += this.codeText.slice(start, child.startIndex);
        traverse(child, child.startIndex, nodeType);
        htmlText += "</span>";
        latexText += lastDelimSymbol;
        start = child.endIndex;
        needSpanEnd = false;
        i = i + 1;
      } else if (nodeType == "float" || nodeType == "integer") {
        // color for number
        htmlText +=
          "<span style='color: " + codeStyle.colors.numberColor.value + "'>";
        latexText += "?@";
        lastDelimSymbol = "@?";
        needSpanEnd = true;
      } else if (nodeType == "comment") {
        // color for comment
        htmlText +=
          "<span style='color: " + codeStyle.colors.commentColor.value + "'>";
        needSpanEnd = true;
      } else if (nodeType == "assignment" || nodeType == "binary_operator") {
        // take care of the middle operator
        for (i; i < node.childCount; i++) {
          const child = node.child(i);
          if (i == 1) {
            htmlText +=
              "<span style='color: " +
              codeStyle.colors.operatorColor.value +
              "'>";
            latexText += "@*";
            lastDelimSymbol = "*@";
          }
          htmlText += this.codeText.slice(start, child.startIndex);
          latexText += this.codeText.slice(start, child.startIndex);
          traverse(child, child.startIndex, nodeType);
          if (i == 1) {
            htmlText += "</span>";
            latexText += lastDelimSymbol;
          }
          start = child.endIndex;
        }
        needSpanEnd = false;
      } else if (nodeType == "decorator") {
        htmlText +=
          "<span style='color: " + codeStyle.colors.decoratorColor.value + "'>";
        latexText += "?*";
        lastDelimSymbol = "*?";
        needSpanEnd = true;
      } else if (codeKeywords.checkInKeywords(nodeType)) {
        // color for keywords
        htmlText +=
          "<span style='color: " + codeStyle.colors.keywordColor.value + "'>";
        needSpanEnd = true;
      } else {
        needSpanEnd = false;
      }
      for (i; i < node.childCount; i++) {
        const child = node.child(i);
        // Append the htmlText between the previous end and the start of the current child
        htmlText += this.codeText.slice(start, child.startIndex);
        latexText += this.codeText.slice(start, child.startIndex);
        // Recursively process the child
        traverse(child, child.startIndex, nodeType);
        // Update the start index to the end of the current child
        start = child.endIndex;
      }
      // Append the htmlText from the last child to the end of the current node
      htmlText += this.codeText.slice(start, node.endIndex);
      latexText += this.codeText.slice(start, node.endIndex);
      if (needSpanEnd) {
        htmlText += "</span>";
        latexText += lastDelimSymbol;
      }
    };
    // Start the traversal from the root node
    traverse(node, node.startIndex, node.type);
    latexText += "\n\\end{pythonBlock}\n\\end{document}\n";
    return { html: htmlText, latex: latexText };
  }
}

export default codeParser;
