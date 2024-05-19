class codeStyle {
  constructor() {
    this.colors = {
      backgroundColor: { name: "Background Color", value: "#f0faff" },
      borderColor: { name: "Border Color", value: "#7888FF" },
      baseColor: { name: "Base Color", value: "#081935" },
      keywordColor: { name: "Keyword Color", value: "#ff2e62" },
      stringColor: { name: "String Color", value: "#0bc1a3" },
      parameterColor: { name: "Parameter Color", value: "#fd0dd1" },
      functionColor: { name: "Function Color", value: "#1d7dfc" },
      callColor: { name: "Call Color", value: "#1d7dfc" },
      attributeColor: { name: "Attribute Color", value: "#ff0000" },
      numberColor: { name: "Number Color", value: "#e78a08" },
      commentColor: { name: "Comment Color", value: "#8e8e8e" },
      operatorColor: { name: "Operator Color", value: "#25884b" },
      decoratorColor: { name: "Decorator Color", value: "#ff00ff" },
    };

    this.sizes = {
      borderWidth: {
        name: "Border Width",
        value: 1,
        min: "0",
        max: "9",
        step: "0.01",
      },
      borderRadius: {
        name: "Border Radius",
        value: 5,
        min: "0",
        max: "9",
        step: "0.01",
      },
      lineHeight: {
        name: "Line Height",
        value: "0",
        min: "0",
        max: "2",
        step: "0.01",
      },
    };
    this.pt2px = 96.0 / 72.0;
    this.styleName = "default";
  }

  toJson() {
    return JSON.stringify(this, null, 2);
  }

  static fromJSONString(jsonString) {
    const jsonObj = JSON.parse(jsonString);
    const style = new codeStyle();
    Object.assign(style, jsonObj);
    return style;
  }

  static fromJSON(jsonObj) {
    const style = new codeStyle();
    Object.assign(style, jsonObj);
    return style;
  }

  hexToCMYK(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    let k = 1 - Math.max(r, g, b);

    let c = 0;
    let m = 0;
    let y = 0;

    if (k < 1) {
      c = (1 - r - k) / (1 - k);
      m = (1 - g - k) / (1 - k);
      y = (1 - b - k) / (1 - k);
    }

    // return string of cmyk
    return `${c.toFixed(2)}, ${m.toFixed(2)}, ${y.toFixed(2)}, ${k.toFixed(2)}`;
  }

  toLatex() {
    let latexText =
      "\\usepackage{listings}\n\\usepackage{xcolor}\n\\usepackage[most]{tcolorbox}\n\\usepackage{fontspec}\n\\selectcolormodel{rgb}\n";
    for (const [_, value] of Object.entries(this.colors)) {
      latexText += `\\definecolor{${"python" + value.name.replace(/\s+/g, "")}}{cmyk}{${this.hexToCMYK(value.value)}}\n`;
    }
    latexText += "\\lstdefinestyle{pythonStyle}{\n";
    latexText += `backgroundcolor=\\color{pythonBackgroundColor}, % change this to change the background color\n`;
    latexText += `commentstyle=\\color{pythonCommentColor}, % change this to change the color for comment\n`;
    latexText += `keywordstyle=\\color{pythonKeywordColor}, % change this to change the color for keywords\n`;
    latexText += `stringstyle=\\color{pythonStringColor}, % change this to change the color for strings\n`;
    latexText += `basicstyle=\\linespread{${this.sizes.lineHeight.value}}\\color{pythonBaseColor}\\ttfamily\\footnotesize, % here you change the line height, the color of all default texts, and the font family as well as the size\n`;
    latexText += `breakatwhitespace=false, % false means line will break on white space and special characters, set it to true to only break at white space\n`;
    latexText += `breaklines=true, % sets automatic line breaking\n`;
    latexText += `captionpos=b, % sets the caption position to bottom\n`;
    latexText += `keepspaces=true, % keeps spaces in text, useful for keeping indentation of code (possibly needs columns=flexible)\n`;
    latexText += `numbers=none, % where to put the line-numbers; possible values are (none, left, right)\n`;
    latexText += `numbersep=5pt, % how far the line-numbers are from the code\n`;
    latexText += `showspaces=false, % do we indicate spaces\n`;
    latexText += `showstringspaces=false, % do we indicate spaces in strings\n`;
    latexText += `showtabs=false, % do we indicate tabs within strings\n`;
    latexText += `tabsize=4, % sets default tabsize to 4 spaces\n`;
    latexText += `xleftmargin=0pt, % sets the margin on left side\n`;
    latexText += `otherkeywords={}, % add to this list if you want to add other keywords\n`;
    latexText += `moredelim=[is][\\color{pythonParameterColor}]{|@}{@|},  % Anything between |@ @| strings will have parameter color\n`;
    latexText += `moredelim=[is][\\color{pythonFunctionColor}]{*|}{|*},  % Anything between *| |* strings will have function color\n`;
    latexText += `moredelim=[is][\\color{pythonCallColor}]{|!}{!|},  % Anything between |! !| strings will have call color\n`;
    latexText += `moredelim=[is][\\color{pythonAttributeColor}]{|?}{?|},  % Anything between |? ?| strings will have attribute color\n`;
    latexText += `moredelim=[is][\\color{pythonNumberColor}]{?@}{@?},  % Anything between ?@ @? strings will have number color\n`;
    latexText += `moredelim=[is][\\color{pythonOperatorColor}]{@*}{*@},  % Anything between @* *@ strings will have operator color\n`;
    latexText += `moredelim=[is][\\color{pythonDecoratorColor}]{?*}{*?},  % Anything between ?* *? strings will have decorator color\n`;

    latexText +=
      "emph={}, % add to this list to change color for emphasized text\n";
    latexText +=
      "emphstyle=\\color{pythonKeywordColor}, % change this to change the color for emphasized text\n";
    latexText += "}\n\n";

    latexText += `\\newtcblisting{pythonBlock}[1]{%`;
    latexText += `boxsep=0pt, % sets the padding of the box\n`;
    latexText += `boxrule=${this.sizes.borderWidth.value}pt, % sets the border width\n`;
    latexText += `arc=${this.sizes.borderRadius.value}pt, % sets the border radius\n`;
    latexText += `auto outer arc, % sets the border radius to be the same as the arc\n`;
    latexText += `colframe=pythonBorderColor, % sets the border color\n`;
    latexText += `colback=pythonBackgroundColor, % sets the background color\n`;
    latexText += `listing only, % only the listing will be colored\n`;
    latexText += `listing options={language=Python, style=pythonStyle}, % sets the style of the listing\n`;
    latexText += `title=#1, % sets the title of the box, you can leave it blank\n`;
    latexText += `fonttitle=\\bfseries, % sets the font of the title\n`;
    latexText += `top=0pt, % sets the top margin\n`;
    latexText += `bottom=0pt, % sets the bottom margin\n`;
    latexText += `left=0pt, % sets the left margin\n`;
    latexText += `right=0pt, % sets the right margin\n`;
    latexText += `}`;
    // console.log(latexText);
    return latexText;
  }
}

export default codeStyle;
