import Editor, { loader, useMonaco } from "@monaco-editor/react";
import * as monaco_editor from "monaco-editor";
import { useCallback, useEffect, useState } from "react";
import { transpile } from "./Transpile.js";
import { importMapScript } from "./Imports.js";
import "./codeExample.css";

type SetupMonaco = (monaco: typeof monaco_editor) => void;

// default loader is a bit out of date, update to latest available
loader.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.39.0/min/vs" },
});

interface CodeEditorProps {
  setupTypes: SetupMonaco;
  height?: number | string;
  width?: number | string;
  code?: string;
  packages?: string[];
  className?: string;
}

const defaults: Partial<CodeEditorProps> = {
  height: "unset",
  width: "unset",
  code: "// hello world",
  packages: [],
};

export function CodeExample(props: CodeEditorProps): JSX.Element {
  const monaco = useMonaco();
  const { height, width, code, packages, setupTypes, className } = {
    ...defaults,
    ...props,
  };
  const [compiledCode, setCompiledCode] = useState(transpile(code!));

  const options: monaco_editor.editor.IStandaloneEditorConstructionOptions = {
    readOnly: false,
    minimap: { enabled: false },
    lineNumbers: "off",
    fontSize: 14,
    fontFamily:
      "'Source Code Pro', source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 0,
  };

  useEffect(() => {
    if (monaco) {
      setupTypes(monaco);
    }
  }, [monaco]);

  const codeChange = useCallback(
    (value: any) => {
      const src = value as string;
      const compiled = transpile(src);
      setCompiledCode(compiled);
    },
    [setCompiledCode]
  );

  const importScript = packages ? importMapScript(packages) : "";
  const containerClasses = `codeContainer ${className || ""}`.trim();

  const html = `
    <html>
      <head>
      <style type="text/css">
        body {
          font-family: sans-serif;
          font-size: 16px;
        }
      </style>
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
    <div className={containerClasses}>
      <Editor
        wrapperProps={{ className: "codeEditor" }}
        {...{ height, width, options }}
        defaultLanguage="typescript"
        defaultValue={code}
        defaultPath="file:///index.ts"
        onChange={codeChange}
        theme="vs-light"
      />
      <iframe srcDoc={html} className="codeExample"></iframe>
    </div>
  );
}
