import React, { CSSProperties, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import "./codeExample.css";

interface CodeEditorProps {
  height?: number | string;
  width?: number | string;
}

const defaults: CodeEditorProps = {
  height: "400px",
  width: "500px",
};

export function CodeEditor(props: CodeEditorProps): JSX.Element {
  const monaco = useMonaco();
  const { height, width } = { ...defaults, ...props };

  const options: editor.IStandaloneEditorConstructionOptions = {
    readOnly: false,
    minimap: { enabled: false },
    lineNumbers: "off",
    fontSize: 16,
  };

  useEffect(() => {
    console.log("monaco", monaco);
  });

  return (
    <div className="codeContainer">
      <Editor
        {...{ height, width }}
        defaultLanguage="javascript"
        defaultValue="// some comment"
        options={options}
      />
      <iframe className="codeExample">tbd</iframe>
    </div>
  );
}
