<template>
  <div
    id="input-area"
    class="flex justify-between items-start w-full h-screen p-10"
  >
    <!-- Color inputs on the left -->

    <div class="flex flex-col items-start space-y-4 mt-10 font-mono">
      <div
        v-for="(color, key) in this.style.colors"
        :key="key"
        class="flex items-center"
      >
        <label :for="key" class="mr-2">{{ color.name }}:</label>
        <input :id="key" v-model="color.value" type="color" class="ml-2" />
        <span class="ml-2">{{ color.value }}</span>
      </div>
    </div>

    <!-- Text area in the center -->
    <div class="flex flex-col items-center mx-5">
      <div class="font-mono text-black mt-5 mb-5 text-center">
        Input Your Code Here<br />(Only Python Supported for Now)
      </div>
      <textarea
        id="codearea"
        class="w-96 h-96 border-2 border-black p-2 font-mono text-xs"
        v-model="codeText"
      ></textarea>
      <div class="font-mono text-black mt-5 mb-3 text-center">
        Preview<br />(Style maybe different in LaTeX)
      </div>
      <div
        id="previewArea"
        class="w-96 h-full min-h-10 whitespace-pre-wrap mb-10 font-mono break-words text-xs"
        :style="textareaStyle"
        v-html="reconstructedHtml"
      ></div>
      <div
        class="border-2 border-black rounded-sm font-mono w-full select-none text-center py-1 hover:scale-105 duration-300 active:scale-100 active:bg-zinc-50 mb-2"
        @click="downloadLatex"
      >
        Download Latex
      </div>

      <div
        class="border-2 border-black rounded-sm font-mono w-full select-none text-center py-1 hover:scale-105 duration-300 active:scale-100 active:bg-zinc-50 mb-2"
        @click="downloadStyle"
      >
        Download Style
      </div>

      <div
        class="border-2 border-black rounded-sm font-mono w-full select-none text-center py-1 hover:scale-105 duration-300 active:scale-100 active:bg-zinc-50 mb-2"
        @click="triggerFileInput"
      >
        Upload Style
      </div>
      <input
        type="file"
        ref="fileInput"
        accept=".json"
        @change="uploadStyle"
        class="hidden"
      />
    </div>

    <!-- Sliders on the right -->
    <div class="flex flex-col items-start space-y-4 mt-10 font-mono">
      <div
        v-for="(item, key) in this.style.sizes"
        :key="key"
        class="flex items-center"
      >
        <label :for="key" class="mr-2">{{ item.name }}:</label>
        <input
          :id="key"
          v-model="item.value"
          type="range"
          :min="item.min"
          :max="item.max"
          :step="item.step"
          class="ml-2"
        />
        <span class="ml-2">{{ parseFloat(item.value).toFixed(2) }} pt</span>
      </div>
      <select
        v-model="selectedFile"
        @change="loadStyle"
        class="border-2 py-1 border-black rounded-sm w-full"
      >
        <option disabled value="">Choose A Style</option>
        <option v-for="file in themes" :key="file" :value="file">
          {{ file.replace(/\.json$/, '') }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import * as TreeSitter from "web-tree-sitter";
import codeKeywords from "@/scripts/codeKeywords.js";
import codeStyle from "@/scripts/codeStyle.js";
import codeParser from "@/scripts/codeParser.js";
export default {
  name: "Parser",
  data() {
    return {
      parser: null,
      tree: null,
      keywords: new codeKeywords(),
      style: new codeStyle(),
      codeParser: new codeParser(),
      codeText: "",
      htmlText: "",
      latexText: "",
      themes: [],
      selectedFile: "",
    };
  },
  computed: {
    textareaStyle() {
      return {
        backgroundColor: this.style.colors.backgroundColor.value,
        boxShadow: `0 0 0 ${this.style.sizes.borderWidth.value * this.style.pt2px}px ${this.style.colors.borderColor.value}`,
        borderRadius:
          this.style.sizes.borderRadius.value * this.style.pt2px + "px",
        lineHeight: parseFloat(this.style.sizes.lineHeight.value) / 2.0 + 1.0,
        padding: 6 * this.style.pt2px + "px",
        color: this.style.colors.baseColor.value,
      };
    },

    reconstructedHtml() {
      if (this.codeParser.tree == null) {
        return "";
      }
      const reconstructed = this.codeParser.reconstructHtml(
        this.codeParser.tree.rootNode,
        this.keywords,
        this.style,
      );
      this.htmlText = reconstructed.html;
      this.latexText = reconstructed.latex;
      return this.htmlText;
    },
  },
  watch: {
    async codeText() {
      await this.codeParser.parseCode(this.codeText);
    },
  },

  methods: {
    downloadLatex() {
      const latexStyle = this.style.toLatex();
      var styleBlob = new Blob([latexStyle], { type: "text/plain" });
      var url = URL.createObjectURL(styleBlob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "pythonStyle.tex";
      a.click();

      var codeBlob = new Blob([this.latexText], { type: "text/plain" });
      url = URL.createObjectURL(codeBlob);
      a.href = url;
      a.download = "code.tex";
      a.click();
    },
    downloadStyle() {
      var currentStyle = this.style.toJson();
      var styleBlob = new Blob([currentStyle], {
        type: "application/json",
      });
      var url = URL.createObjectURL(styleBlob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "style.json";
      a.click();
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    uploadStyle(event) {
      const file = event.target.files[0];
      if (file && file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonString = e.target.result;
            this.style = codeStyle.fromJSONString(jsonString);
            console.log("Style uploaded:", this.style);
          } catch (error) {
            console.error("Error parsing JSON:", error);
            alert("Error parsing JSON file.");
          }
        };
        reader.readAsText(file);
        event.target.value = "";
      } else {
        alert("Please upload a valid JSON file.");
      }
    },
    async loadStyle() {
      if (this.selectedFile) {
        try {
          const filePath = `${process.env.BASE_URL}assets/${this.selectedFile}`;
          const response = await fetch(filePath);
          if (response.ok) {
            this.jsonContent = await response.json();
            this.style = codeStyle.fromJSON(this.jsonContent);
          } else {
            console.error("Failed to load file:", response.statusText);
          }
        } catch (error) {
          console.error("Error loading JSON:", error);
        }
      }
    },
  },

  async mounted() {
    await this.codeParser.init();
    const context = require.context("../../public/assets", false, /\.json$/);
    this.themes = context.keys().map((key) => key.replace("./", ""));
    console.log(this.themes);
  },
};
</script>

<style scoped>
#codearea {
  resize: none;
}
</style>
