import React, { useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

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

  useEffect(() => {
    console.log("monaco", monaco);
  });

  return (
    <div>
      <Editor
        {...{ height, width }}
        defaultLanguage="javascript"
        defaultValue="// some comment"
      />
      <iframe>tbd</iframe>
    </div>
  );
}
