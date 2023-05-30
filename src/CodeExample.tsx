import Editor, { useMonaco, loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { editor, languages, Uri } from "monaco-editor";
import React, { useCallback, useEffect, useState } from "react";
import "./codeExample.css";
import { importMapScript, transpile } from "./Transpile.js";
import thimbleberryPackage from "/node_modules/thimbleberry/package.json?raw";
import webgpuTypes from "/node_modules/@webgpu/types/dist/index.d.ts?raw";
import webgpuPackage from "/node_modules/@webgpu/types/package.json?raw";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

const modules = import.meta.glob("/node_modules/thimbleberry/dist/**/*.d.ts", {
  as: "raw",
  eager: true,
});

window.MonacoEnvironment = {
  getWorker(_moduleId: unknown, label: string) {
    switch (label) {
      case "typescript":
      case "javascript":
        return new tsWorker();
      default:
        return new editorWorker();
    }
  },
};

const exampleCode = `
  import { labeledGpuDevice } from "thimbleberry";
  
  const device = labeledGpuDevice();
  main(device);
  
  async function main(device: GPUDevice): Promise<void> {
      document.body.innerText = "hello world";
  }
`;

interface CodeEditorProps {
  height?: number | string;
  width?: number | string;
  imports?: string[];
}

const defaults: CodeEditorProps = {
  height: "400px",
  width: "500px",
  imports: ["thimbleberry"],
};

function initializeMonaco() {
  loader.config({ monaco }); // use our monaco instead of react bundler

  languages.typescript.typescriptDefaults.addExtraLib(
    webgpuTypes,
    `file:///node_modules/@webgpu/types/dist/index.d.ts`
  );
  languages.typescript.typescriptDefaults.addExtraLib(
    webgpuPackage,
    `file:///node_modules/@webgpu/types/package.json`
  );
  languages.typescript.typescriptDefaults.setCompilerOptions({
    types: ["@webgpu/types"],
    moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
    module: languages.typescript.ModuleKind.ESNext,
  });

  languages.typescript.typescriptDefaults.addExtraLib(
    thimbleberryPackage,
    `file:///node_modules/thimbleberry/package.json`
  );

  for (const [path, source] of Object.entries(modules)) {
    console.log(path);
    languages.typescript.typescriptDefaults.addExtraLib(
      source,
      `file://${path}`
    );
  }

  languages.typescript.typescriptDefaults.setEagerModelSync(true);
  const uri = Uri.parse("file:///index.ts");
  const model = editor.createModel(exampleCode, "typescript", uri);
  return model;
}

initializeMonaco();

export function CodeEditor(props: CodeEditorProps): JSX.Element {
  const { height, width, imports } = { ...defaults, ...props };
  const [compiledCode, setCompiledCode] = useState(transpile(exampleCode));

  const options: editor.IStandaloneEditorConstructionOptions = {
    readOnly: false,
    minimap: { enabled: false },
    lineNumbers: "off",
    fontSize: 16,
  };

  const codeChange = useCallback(
    (value: any) => {
      const src = value as string;
      const compiled = transpile(src);
      console.log({ compiled });
      setCompiledCode(compiled);
    },
    [setCompiledCode]
  );

  const importScript = importMapScript(imports!);

  const html = `
    <html>
      <head>
      </head>
      <body>
        ${importScript}
        <script type="module">
          ${compiledCode}
        </script>
      </body>
    </html>
  `;

  return (
    <div className="codeContainer">
      <Editor
        {...{ height, width }}
        defaultLanguage="typescript"
        defaultPath="file:///index.ts"
        options={options}
        onChange={codeChange}
      />
      <iframe srcDoc={html} className="codeExample"></iframe>
    </div>
  );
}
