import Editor, { useMonaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import React, { useCallback, useEffect } from "react";
import "./codeExample.css";
import { transpile } from "./Transpile.js";

interface CodeEditorProps {
  height?: number | string;
  width?: number | string;
}

const defaults: CodeEditorProps = {
  height: "400px",
  width: "500px",
};

export function CodeEditor(props: CodeEditorProps): JSX.Element {
  // const monaco = useMonaco();
  const { height, width } = { ...defaults, ...props };

  const options: editor.IStandaloneEditorConstructionOptions = {
    readOnly: false,
    minimap: { enabled: false },
    lineNumbers: "off",
    fontSize: 16,
  };

  const codeChange = useCallback((value: any) => {
    const src = value as string;
    const compiled = transpile(src);
    console.log({ compiled });
  }, []);

  useEffect(() => {
    // console.log("monaco", monaco);
  });

  return (
    <div className="codeContainer">
      <Editor
        {...{ height, width }}
        defaultLanguage="typescript"
        defaultValue="// some comment"
        options={options}
        onChange={codeChange}
      />
      <iframe className="codeExample">tbd</iframe>
    </div>
  );
}
