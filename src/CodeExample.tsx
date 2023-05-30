import Editor, { useMonaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import React, { useCallback, useEffect, useState } from "react";
import "./codeExample.css";
import { importMapScript, transpile } from "./Transpile.js";

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

export function CodeEditor(props: CodeEditorProps): JSX.Element {
  // const monaco = useMonaco();
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

  useEffect(() => {
    // console.log("monaco", monaco);
  });
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
        defaultValue={exampleCode}
        options={options}
        onChange={codeChange}
      />
      <iframe srcDoc={html} className="codeExample"></iframe>
    </div>
  );
}
